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

import {
  FieldElement,
  TransformStepFn,
} from '../../types';
import { traverseLayout } from '../util';

// fields with these names should stay LTR by default
export const ltrOnlyFieldNames = ['credentials.passcode', 'identifier', 'credentials.newPassword', 'confirmPassword'];

export const setLtrFields: TransformStepFn = (formbag) => {
  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => {
      if (el.type !== 'Field') {
        return false;
      }

      const fieldElement = (el as FieldElement);
      return ltrOnlyFieldNames.includes(fieldElement.options.inputMeta.name);
    },
    callback: (el) => {
      // only set dir here when it has not already been set and overridden
      if (el.type === 'Field' && typeof el.dir === 'undefined') {
        // eslint-disable-next-line no-param-reassign
        el.dir = 'ltr';
      }
    },
  });
  return formbag;
};
