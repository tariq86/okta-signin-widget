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

import { loc } from 'okta';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  TitleElement,
} from '../../types';

export const transformPhoneCodeEnrollment: IdxStepTransformer = ({ transaction, formBag }) => {
  const { nextStep: { relatesTo } = {} } = transaction;
  const { uischema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.phone.enroll.title', 'login'),
    },
  };

  const informationalTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      // TODO: revisit this for oie i18n string (ChallengeAuthenticatorPhoneView.js)
      content: relatesTo?.value?.methods?.[0]?.type === 'sms'
        ? loc('next.phone.verify.sms.codeSentText', 'login')
        : loc('next.phone.verify.voice.calling', 'login'),
    },
  };

  const carrierChargeDisclaimerText: DescriptionElement = {
    type: 'Description',
    options: {
      content: loc('oie.phone.carrier.charges', 'login'),
    },
  };

  const submitButton: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
    },
  };

  // Element order matters for display purposes:
  // 1. Title 2. Description ... Button is last element
  uischema.elements.unshift(carrierChargeDisclaimerText);
  uischema.elements.unshift(informationalTextElement);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitButton);

  return formBag;
};
