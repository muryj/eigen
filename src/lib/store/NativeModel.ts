import { Action, action, Thunk, thunk } from "easy-peasy"
import { LegacyNativeModules } from "lib/NativeModules/LegacyNativeModules"
import { NotificationsManager } from "lib/NativeModules/NotificationsManager"
import { navigate } from "lib/navigation/navigate"
import { GlobalStore } from "./GlobalStore"

// These should match the values in emission/Pod/Classes/EigenCommunications/ARNotificationsManager.m
export type NativeEvent =
  | {
      type: "STATE_CHANGED"
      payload: NativeState
    }
  | {
      type: "NOTIFICATION_RECEIVED"
      payload: any
    }
  | {
      type: "RESET_APP_STATE"
      payload: NativeState
    }
  | {
      type: "REQUEST_NAVIGATION"
      payload: { route: string }
    }

export interface NativeState {
  userID: string
  authenticationToken: string
  launchCount: number
  onboardingState: "none" | "incomplete" | "complete"

  gravityURL: string
  metaphysicsURL: string
  predictionURL: string
  webURL: string
  userAgent: string

  env: "production" | "staging" | "test"
  deviceId: string

  // Empty is falsy in JS, so these are fine too.
  stripePublishableKey: string
  sentryDSN: string
  legacyFairSlugs: string[]
  legacyFairProfileSlugs: string[]
}

export interface NativeModel {
  sessionState: NativeState
  setLocalState: Action<NativeModel, Partial<NativeState>>
  setApplicationIconBadgeNumber: Thunk<NativeModel, number>
}

export const NativeModel: NativeModel = {
  sessionState: LegacyNativeModules.ARNotificationsManager?.nativeState ?? {},
  setLocalState: action((state, nextNativeState) => {
    Object.assign(state.sessionState, nextNativeState)
  }),
  setApplicationIconBadgeNumber: thunk((_actions, count) => {
    LegacyNativeModules.ARTemporaryAPIModule.setApplicationIconBadgeNumber(count)
  }),
}

export function listenToNativeEvents(cb: (event: NativeEvent) => void) {
  return NotificationsManager.addListener("event", cb)
}

listenToNativeEvents((event: NativeEvent) => {
  switch (event.type) {
    case "STATE_CHANGED":
      GlobalStore.actions.native.setLocalState(event.payload)
      return
    case "NOTIFICATION_RECEIVED":
      GlobalStore.actions.bottomTabs.fetchCurrentUnreadConversationCount()
      return
    case "RESET_APP_STATE":
      GlobalStore.actions.reset()
      GlobalStore.actions.native.setLocalState(event.payload)
      return
    case "REQUEST_NAVIGATION":
      navigate(event.payload.route)
      return
    default:
      assertNever(event)
  }
})
