import { action, Action, computed, Computed, thunk, Thunk, thunkOn, ThunkOn } from "easy-peasy"
import moment from "moment"
import Config from "react-native-config"
import echoLaunchJSON from "../../../Artsy/App/EchoNew.json"
import { GlobalStoreModel } from "./GlobalStoreModel"

type EchoJSON = typeof echoLaunchJSON

const features = {
  ViewingRoomsEnabled: {
    readyForRelease: false,
    echoFlagKey: "AREnableViewingRooms",
  },
} as const

type FeatureName = keyof typeof features

export interface ConfigModel {
  adminFeatureFlagOverrides: { [k in FeatureName]: boolean | null }
  echoState: EchoJSON
  sessionState: {
    webURL: string
    gravityBaseURL: string
    gravitySecret: string
    gravityKey: string
  }
  didRehydrate: ThunkOn<ConfigModel, {}, GlobalStoreModel>
  setEchoState: Action<ConfigModel, EchoJSON>
  fetchRemoteEcho: Thunk<ConfigModel>
  features: Computed<ConfigModel, { [k in FeatureName]: boolean }>
  setAdminOverride: Action<ConfigModel, { key: FeatureName; value: boolean | null }>
}
export const ConfigModel: ConfigModel = {
  adminFeatureFlagOverrides: {} as any,
  features: computed((state) => {
    const result = {} as any
    for (const [key, val] of Object.entries(features)) {
      result[key] =
        state.adminFeatureFlagOverrides[key as FeatureName] ??
        state.echoState.features.find((f) => f.name === val.echoFlagKey)?.value ??
        val.readyForRelease
    }
    return result
  }),
  echoState: echoLaunchJSON,
  sessionState: {
    webURL: "https://staging.artsy.net",
    gravityBaseURL: "https://stagingapi.artsy.net",
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
      const persistedEchoTimestamp = moment(store.getState().echoState.updated_at)
      const launchEchoTimestamp = moment(echoLaunchJSON.updated_at)
      console.log({ persistedEchoTimestamp, launchEchoTimestamp })
      if (launchEchoTimestamp.isAfter(persistedEchoTimestamp)) {
        console.log("HELLOOOOO")
        actions.setEchoState(echoLaunchJSON)
      }
      actions.fetchRemoteEcho()
    }
  ),
  setAdminOverride: action((state, { key, value }) => {
    state.adminFeatureFlagOverrides[key] = value
  }),
}
