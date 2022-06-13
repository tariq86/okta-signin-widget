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

import { ControlProps } from '@jsonforms/core';
import { Box, NativeSelect } from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useEffect } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, Choice } from 'src/types';

import { getLabelName } from '../helpers';

const SelectControl: FunctionComponent<ControlProps> = ({
  path,
  data,
  label,
  uischema,
  handleChange,
  visible,
  errors,
}: ControlProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    // on mount, if pre-selected value, update.
    const defaultOption = uischema.options?.defaultOption;
    if (defaultOption) {
      handleChange(path, defaultOption);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (visible ? (
    // @ts-ignore OKTA-471233
    <Box marginBottom="m">
      <NativeSelect
        error={errors}
        label={t(getLabelName(label))}
        name={path}
        id={uischema.scope}
        value={data || ''}
        onChange={(e: ChangeEvent) => handleChange(path, e.target.value)}
      >
        {
          [<NativeSelect.Option
            value=""
            key="empty"
          />].concat(
            uischema.options?.choices?.map((item: Choice) => (
              <NativeSelect.Option
                key={item.key}
                value={item.key}
              >
                {t(item.value)}
              </NativeSelect.Option>
            )) || [],
          )
        }
      </NativeSelect>
    </Box>
  ) : null);
};

export default SelectControl;
