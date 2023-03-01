/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { HttpResponse, RawIdxResponse } from '@okta/okta-auth-js';
// eslint-disable-next-line import/no-extraneous-dependencies
import IonResponseHelper from 'v2/ion/IonResponseHelper';

import Util from '../../../util/Util';
import { loc } from './locUtil';

export const formatError = (
  data: RawIdxResponse | HttpResponse['responseJSON'],
): { responseJSON: HttpResponse['responseJSON'] } => {
  if (IonResponseHelper.isIonErrorResponse(data)) {
    return IonResponseHelper.convertFormErrors(data);
  } if ((data as HttpResponse['responseJSON'])?.errorSummary) {
    return { responseJSON: data };
  }

  Util.logConsoleError(data);
  return {
    responseJSON: {
      errorSummary: loc('error.unsupported.response', 'login'),
    },
  };
};
