/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AuthApiError,
  IdxMessage,
  IdxTransaction,
  OAuthError,
  OktaAuth,
} from '@okta/okta-auth-js';
import { MutableRef, StateUpdater } from 'preact/hooks';

import { FormBag, LanguageDirection } from './schema';
import { WidgetProps } from './widget';

export type IWidgetContext = {
  authClient: OktaAuth;
  widgetProps: WidgetProps;
  message: IdxMessage | undefined;
  setMessage: StateUpdater<IdxMessage | undefined>;
  // // TODO: OKTA-502849 - Update param type
  // (RenderSuccessCallback / RenderErrorCallback) once merged into okta-signin-widget
  onSuccessCallback?: (data: Record<string, unknown>) => void;
  onErrorCallback?: (data: Record<string, unknown>) => void;
  idxTransaction: IdxTransaction | undefined;
  setResponseError: StateUpdater<AuthApiError | OAuthError | null>;
  setIdxTransaction: StateUpdater<IdxTransaction | undefined>;
  setIsClientTransaction: StateUpdater<boolean>;
  stepToRender: string | undefined;
  setStepToRender: StateUpdater<string | undefined>;
  data: FormBag['data'];
  setData: StateUpdater<FormBag['data']>;
  dataSchemaRef: MutableRef<FormBag['dataSchema'] | undefined>;
  loading: boolean;
  setLoading: StateUpdater<boolean>;
  setWidgetRendered: StateUpdater<boolean>;
  loginHint?: string | null;
  setloginHint: StateUpdater<string | null>;
  languageCode: string;
  languageDirection: LanguageDirection;
};

// Stepper context
export type IStepperContext = {
  stepIndex: number;
  setStepIndex: StateUpdater<number | undefined>;
};
