import { action, Action, computed, Computed, thunk, Thunk, thunkOn, ThunkOn } from "easy-peasy"
import moment from "moment"
import Config from "react-native-config"
import echoLaunchJSON from "../../../Artsy/App/EchoNew.json"
import { FeatureName, features } from "./features"

import { GlobalStoreModel } from "./GlobalStoreModel"

export type FeatureMap = { [k in FeatureName]: boolean }

type EchoJSON = typeof echoLaunchJSON

export interface ConfigModel {
  adminFeatureFlagOverrides: { [k in FeatureName]: boolean | null }
  echoState: EchoJSON
  sessionState: {
    webURL: string
    gravityBaseURL: string
    metaphysicsBaseURL: string
    predictionBaseURL: string
    gravitySecret: string
    gravityKey: string
  }
  didRehydrate: ThunkOn<ConfigModel, {}, GlobalStoreModel>
  setEchoState: Action<ConfigModel, EchoJSON>
  fetchRemoteEcho: Thunk<ConfigModel>
  features: Computed<ConfigModel, FeatureMap>
  setAdminOverride: Action<ConfigModel, { key: FeatureName; value: boolean | null }>
}
export const ConfigModel: ConfigModel = {
  adminFeatureFlagOverrides: {} as any,
  features: computed((state) => {
    const result = {} as any
    for (const [key, feature] of Object.entries(features)) {
      if (state.adminFeatureFlagOverrides[key as FeatureName] != null) {
        // If there's an admin override, it takes precedence
        result[key] = state.adminFeatureFlagOverrides[key as FeatureName]
      } else if (feature.readyForRelease) {
        // If the feature is ready for release, the echo flag takes precedence
        const echoFlag = state.echoState.features.find((f) => f.name === feature.echoFlagKey)

        if (feature.echoFlagKey && !echoFlag && __DEV__) {
          console.error("No echo flag found for feature", key)
        }
        result[key] = echoFlag?.value ?? true
      } else {
        // If the feature is not ready for release, uh, don't show it
        result[key] = false
      }
    }
    return result
  }),
  echoState: echoLaunchJSON,
  sessionState: {
    webURL: "https://staging.artsy.net",
    gravityBaseURL: "https://stagingapi.artsy.net",
    metaphysicsBaseURL: "https://metaphysics-staging.artsy.net/v2",
    predictionBaseURL: "https://live-staging.artsy.net",
    gravityKey: Config.ARTSY_API_CLIENT_KEY,
    gravitySecret: Config.ARTSY_API_CLIENT_SECRET,
  },
  setEchoState: action((state, echoJSON) => {
    state.echoState = echoJSON
  }),
  fetchRemoteEcho: thunk(async (actions) => {
    const result = await fetch("https://echo.artsy.net/Echo.json")
    if (result.ok) {
      const json = await result.json()
      actions.setEchoState(json)
    }
  }),
  didRehydrate: thunkOn(
    (_, storeActions) => storeActions.rehydrate,
    (actions, __, store) => {
      // If the app was just updated, then it's possible that the persisted echo config is
      // older than the version in this JS bundle. We should always use the latest version
      const persistedEchoTimestamp = moment(store.getState().echoState.updated_at)
      const launchEchoTimestamp = moment(echoLaunchJSON.updated_at)
      if (launchEchoTimestamp.isAfter(persistedEchoTimestamp)) {
        actions.setEchoState(echoLaunchJSON)
      }
      actions.fetchRemoteEcho()
    }
  ),
  setAdminOverride: action((state, { key, value }) => {
    state.adminFeatureFlagOverrides[key] = value
  }),
}
