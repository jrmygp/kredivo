import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import localForage from "localforage";
import type { LoginResponse } from "@/features/auth/types";

const actionTypes = {
  SET_USER: "SET_USER",
  RESET_USER: "RESET_USER",
} as const;

export type RootState = {
  user: LoginResponse | null;
};

type SetUserAction = {
  type: typeof actionTypes.SET_USER;
  payload: LoginResponse;
};

type ResetUserAction = {
  type: typeof actionTypes.RESET_USER;
};

type RootAction = SetUserAction | ResetUserAction;

const globalState: RootState = {
  user: null,
};

const rootReducer = (state = globalState, action: RootAction): RootState => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };
    case actionTypes.RESET_USER:
      return { ...state, user: null };

    default:
      return state;
  }
};

const persistConfig = {
  key: "root",
  storage: localForage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(persistedReducer);
export const persistor = persistStore(store);

export const mapStateToProps = (state: RootState) => {
  return state;
};

export const mapDispatchToProps = (dispatch: typeof store.dispatch) => ({
  handleSetUser: (user: LoginResponse) => dispatch({ type: actionTypes.SET_USER, payload: user }),
  handleResetState: () => dispatch({ type: actionTypes.RESET_USER }),
});
