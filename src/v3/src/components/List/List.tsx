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

import { List as ListOdyssey } from '@okta/odyssey-react';
import { Box, Typography } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import Logger from '../../../../util/Logger';
import {
  ButtonElement,
  DescriptionElement,
  ListElement,
  UISchemaElement,
  UISchemaElementComponent,
  UISchemaLayout,
} from '../../types';
import { getElementKey } from '../../util';
import Button from '../Button';
import InformationalText from '../InformationalText';

const renderElement = (item: UISchemaElement) => {
  const Container: FunctionComponent = ({ children }) => (
    <Box
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(!(item).noMargin && { marginBlockEnd: 4 })}
    >
      {children}
    </Box>
  );

  switch (item.type) {
    case 'Button':
      return (
        <Container>
          <Button uischema={item as ButtonElement} />
        </Container>
      );
    case 'Description':
      return (
        <Container>
          <InformationalText uischema={item as DescriptionElement} />
        </Container>
      );
    default:
      Logger.warn('Unsupported element type in List: ', item.type);
      return null;
  }
};

const renderLayout = (item: UISchemaLayout) => {
  const { elements } = item;

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      {
        elements.map((element) => renderElement(element))
      }
    </Box>
  );
};

const List: UISchemaElementComponent<{
  uischema: ListElement
}> = ({ uischema }) => {
  const { options } = uischema;

  return options.items?.length ? (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      marginBlockEnd={4}
    >
      { options.description && <Typography component="p">{options.description}</Typography> }
      <ListOdyssey listType={options.type ?? 'unordered'}>
        {
          options.items.map((item: string | UISchemaLayout, index: number) => (
            <ListOdyssey.Item key={typeof item === 'string' ? item : getElementKey(item, index)}>
              {typeof item === 'string' ? item : renderLayout(item) }
            </ListOdyssey.Item>
          ))
        }
      </ListOdyssey>
    </Box>
  ) : null;
};

export default List;
