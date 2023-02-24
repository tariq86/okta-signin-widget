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

import { useMediaQuery } from '@mui/material';
import { Box } from '@okta/odyssey-react-mui';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';

import { useWidgetContext } from '../../contexts';
import style from './style.module.css';

const AuthContainer: FunctionComponent = ({ children }) => {
  const { languageDirection, languageCode } = useWidgetContext();
  const classes = classNames('auth-container', 'main-container', style.mainViewContainer);
  const isMobileWidth = useMediaQuery('screen and (max-width: 391px)');

  return (
    <Box
      id="okta-sign-in"
      component="main"
      display="flex"
      justifyContent="center"
      alignItems="center"
      className={classes}
      // data-version={VERSION}
      // data-commit={COMMITHASH}
      lang={languageCode}
      dir={languageDirection}
    >
      <Box
        flex="auto"
        flexDirection="column"
        border={isMobileWidth ? 0 : 1}
        borderRadius={1}
        borderColor="grey.400"
        bgcolor="common.white"
        fontFamily="fontFamily"
        className={style.siwContainer}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AuthContainer;
