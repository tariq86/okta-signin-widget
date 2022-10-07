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

import { Box } from '@mui/material';
import { FunctionComponent, h } from 'preact';

import {
  UISchemaElement,
  UISchemaElementComponent,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { getElementKey, isDevelopmentEnvironment, isTestEnvironment } from '../../util';
import renderers from './renderers';

/**
 *
 * The purpose of this component is to act as an abstracted layer
 * for use by non standard UISchemaLayout interfaces to prevent a circular dependency
 * i.e. {@link AccordionLayout} and {@link StepperLayout}
 *
 */
const LayoutContainer: FunctionComponent<{ uischema: UISchemaLayout }> = ({ uischema }) => {
  const { type, elements } = uischema;

  const isHorizontalLayout = type === UISchemaLayoutType.HORIZONTAL;
  const flexDirection = isHorizontalLayout ? 'row' : 'column';
  return (
    <Box
      display="flex"
      flexDirection={flexDirection}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(isHorizontalLayout && { gap: 1 })}
    >
      {
        elements.map((element, index) => {
          const elementKey = getElementKey(element, index);

          if ([UISchemaLayoutType.HORIZONTAL, UISchemaLayoutType.VERTICAL]
            .includes((element as UISchemaLayout).type)) {
            return <LayoutContainer uischema={element as UISchemaLayout} />;
          }

          const renderer = renderers.find((r) => r.tester(element));
          if (!renderer) {
            // TODO: for now do not render for unmatch render object
            // remove unnecessary uischema in future refactor and throw error
            // throw new Error(`Failed to find render component for uischema: ${JSON.stringify(element)}`);
            if (isDevelopmentEnvironment() || isTestEnvironment()) {
              console.warn(`Failed to find render component for uischema: ${JSON.stringify(element)}`);
            }
            return null;
          }

          const uischemaElement = (element as UISchemaElement);
          const Component = renderer.renderer as UISchemaElementComponent;
          return (
            <Box
              key={elementKey}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...(!(uischemaElement).noMargin && { marginBottom: 4 })}
            >
              <Component uischema={uischemaElement} />
            </Box>
          );
        })
      }
    </Box>
  );
};

export default LayoutContainer;
