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

import { Box, Typography } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { useHtmlContentParser } from '../../hooks';
import { HeadingElement, UISchemaElementComponent } from '../../types';

const Heading: UISchemaElementComponent<{
  uischema: HeadingElement
}> = ({ uischema }) => {
  const {
    noTranslate,
    options: {
      content, dataSe, level, visualLevel,
    },
  } = uischema;
  const parsedContent = useHtmlContentParser(content);

  const variant = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
  }[options.level] ?? 'h2';

  const component = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
  }[options.visualLevel] ?? 'h3';

  return (
    <Box
      display="flex"
      justifyContent="flex-start"
      marginBlockEnd={2}
    >
      <Typography
        id={uischema.id}
        variant={`h${level ?? 2}`}
        component={`h${visualLevel ?? 3}`}
        className={noTranslate ? 'no-translate' : undefined}
        data-se={dataSe}
      >
        {parsedContent}
      </Typography>
    </Box>
  );
};

export default Heading;
