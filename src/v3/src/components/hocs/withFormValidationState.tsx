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

import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { getMessage } from '../../../../v2/ion/i18nTransformer';
import { useFormFieldValidation } from '../../hooks';
import { ChangeEvent, FieldElement, UISchemaElementComponent } from '../../types';
import { getDisplayName } from './getDisplayName';

export type RendererComponent<T> = {
  (props: T): h.JSX.Element;
  displayName: string;
  name?: string;
};

export type WrappedFunctionComponent<T> = (
  Component: UISchemaElementComponent<T>
) => RendererComponent<T>;

export const withFormValidationState: WrappedFunctionComponent<
{ uischema: FieldElement } & {
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}> = (Component) => {
  const ParentComponent: RendererComponent<
  { uischema: FieldElement }> = (props: { uischema: FieldElement }) => {
    const { uischema } = props;
    const {
      options: {
        inputMeta: {
          // @ts-ignore expose type from auth-js
          messages = {},
        },
      },
    } = uischema;
    const errorFromSchema = messages?.value?.[0] && getMessage(messages.value[0]);
    const [touched, setTouched] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>();
    const onValidateHandler = useFormFieldValidation(uischema);

    // For server side errors, need to reset the touched value
    useEffect(() => {
      setTouched(false);
    }, [errorFromSchema]);

    const combinedProps = {
      ...props,
      touched,
      setTouched,
      error: touched ? error : errorFromSchema,
      setError,
      onValidateHandler,
    };
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component {...combinedProps} />;
  };
  ParentComponent.displayName = `WithFormValidationState(${getDisplayName(ParentComponent)})`;
  return ParentComponent;
};
