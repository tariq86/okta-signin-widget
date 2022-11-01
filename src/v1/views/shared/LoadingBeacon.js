/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { View } from '@okta/okta';
import hbs from '@okta/handlebars-inline-precompile';
export default View.extend({
  template: hbs(
    '\
      <div class="beacon-blank"></div>\
      <div class="bg-helper auth-beacon auth-beacon-security" data-se="loading-beacon">\
      <div class="okta-sign-in-beacon-border auth-beacon-border js-auth-beacon-border"></div>\
      </div>\
    '
  ),

  equals: function(Beacon) {
    return Beacon && this instanceof Beacon;
  },
});
