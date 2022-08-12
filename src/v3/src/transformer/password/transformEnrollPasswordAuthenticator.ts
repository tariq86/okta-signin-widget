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

import { IdxMessage } from '@okta/okta-auth-js';

import { PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS } from '../../constants';
import {
  FieldElement,
  FormBag,
  IdxStepTransformer,
  PasswordRequirementsElement,
  PasswordSettings,
  TitleElement,
} from '../../types';
import { getUserInfo, loc } from '../../util';
import { getUIElementWithName, removeUIElementWithName } from '../utils';
import { buildPasswordRequirementListItems } from './passwordSettingsUtils';

export const transformEnrollPasswordAuthenticator: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { nextStep: { relatesTo } = {} } = transaction;
  const passwordSettings = (relatesTo?.value?.settings || {}) as PasswordSettings;

  const { uischema, dataSchema } = formBag;

  let passwordFieldName = 'credentials.passcode';
  let passwordElement = getUIElementWithName(
    passwordFieldName,
    uischema.elements as FieldElement[],
  ) as FieldElement;
  if (!passwordElement) {
    passwordFieldName = 'credentials.newPassword';
    passwordElement = getUIElementWithName(
      passwordFieldName,
      uischema.elements as FieldElement[],
    ) as FieldElement;
  }
  if (passwordElement) {
    passwordElement.options = {
      ...passwordElement.options,
      attributes: {
        ...passwordElement.options?.attributes,
        autocomplete: 'new-password',
      },
    };
  }
  uischema.elements = removeUIElementWithName(
    passwordFieldName,
    uischema.elements,
  );

  const confirmPasswordElement: FieldElement = {
    type: 'Field',
    options: {
      inputMeta: {
        name: 'credentials.confirmPassword',
        secret: true,
        // @ts-ignore expose type from auth-js
        messages: { value: undefined },
      },
      attributes: { autocomplete: 'new-password' },
    },
  };

  // @ts-ignore expose type from auth-js
  if (passwordElement.options.inputMeta.messages?.value?.length) {
    // @ts-ignore expose type from auth-js
    const errorMessages = passwordElement.options.inputMeta.messages.value;
    // @ts-ignore expose type from auth-js
    const newPasswordErrors = errorMessages.filter((message: IdxMessage & { name?: string }) => {
      const { name: newPwName } = passwordElement.options.inputMeta;
      return message.name === newPwName || message.name === undefined;
    });
    if (newPasswordErrors?.length) {
      // @ts-ignore expose type from auth-js
      passwordElement.options.inputMeta.messages.value = newPasswordErrors;
    } else {
      // @ts-ignore expose type from auth-js
      passwordElement.options.inputMeta.messages.value = undefined;
    }

    // @ts-ignore expose type from auth-js
    const confirmPasswordError = errorMessages.find((message: IdxMessage & { name?: string }) => {
      const { name: confirmPwName } = confirmPasswordElement.options.inputMeta;
      return message.name === confirmPwName;
    });
    if (confirmPasswordError) {
      // @ts-ignore expose type from auth-js
      confirmPasswordElement.options.inputMeta.messages.value = [confirmPasswordError];
    }
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('oie.password.enroll.title', 'login') },
  };

  const passwordRequirementsElement: PasswordRequirementsElement = {
    type: 'PasswordRequirements',
    options: {
      id: 'password-authenticator--list',
      header: loc('password.complexity.requirements.header', 'login'),
      userInfo: getUserInfo(transaction),
      settings: passwordSettings,
      fieldKey: passwordFieldName,
      requirements: buildPasswordRequirementListItems(passwordSettings),
      validationDelayMs: PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS,
    },
  };

  uischema.elements = [
    titleElement,
    passwordRequirementsElement,
    passwordElement,
    confirmPasswordElement,
  ];

  // update default dataSchema
  dataSchema.fieldsToExclude = ['credentials.confirmPassword'];
  dataSchema[passwordFieldName] = {
    validate: (data: FormBag['data']) => {
      const newPw = data[passwordFieldName];
      const confirmPw = data['credentials.confirmPassword'];
      const errorMessages: Partial<IdxMessage & { name?: string }>[] = [];
      if (!newPw) {
        errorMessages.push({
          name: passwordFieldName,
          message: loc('model.validation.field.blank', 'login'),
          i18n: { key: 'model.validation.field.blank' },
        });
      }

      if (!confirmPw) {
        errorMessages.push({
          name: 'credentials.confirmPassword',
          message: loc('model.validation.field.blank', 'login'),
          i18n: { key: 'model.validation.field.blank' },
        });
      } else if (confirmPw !== newPw) {
        errorMessages.push({
          name: 'credentials.confirmPassword',
          message: loc('password.error.match', 'login'),
          i18n: { key: 'password.error.match' },
        });
      }

      return errorMessages.length ? errorMessages : undefined;
    },
  };

  return formBag;
};
