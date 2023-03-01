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

import { PASSWORD_REQUIREMENTS_KEYS } from '../../constants';
import {
  AgeRequirements,
  ComplexityKeys,
  ComplexityRequirements,
  GetAgeFromMinutes,
  ListItem,
  PasswordSettings,
} from '../../types';
import { loc } from '../../util';

export const getAgeFromMinutes = (minutes: number): GetAgeFromMinutes => {
  const hours = minutes / 60;
  if (hours < 1) {
    return { unitLabel: PASSWORD_REQUIREMENTS_KEYS.age.minAgeMinutes, value: minutes };
  }
  const days = hours / 24;
  if (days < 1) {
    return { unitLabel: PASSWORD_REQUIREMENTS_KEYS.age.minAgeHours, value: Math.ceil(hours) };
  }
  return { unitLabel: PASSWORD_REQUIREMENTS_KEYS.age.minAgeDays, value: Math.ceil(days) };
};

export const getComplexityItems = (complexity?: ComplexityRequirements): ListItem[] => {
  const items: ListItem[] = [];

  if (!complexity) {
    return items;
  }

  Object.entries(complexity).forEach(([key, value]) => {
    if (key === 'excludeAttributes' && value.length > 0) {
      if (value.includes('firstName')) {
        items.push({
          ruleKey: 'firstName',
          label: loc(PASSWORD_REQUIREMENTS_KEYS.complexity.excludeFirstName, 'login'),
        });
      }
      if (value.includes('lastName')) {
        items.push({
          ruleKey: 'lastName',
          label: loc(PASSWORD_REQUIREMENTS_KEYS.complexity.excludeLastName, 'login'),
        });
      }
    } else if (key === 'minLength' && value > 0) {
      items.push({
        ruleKey: key,
        label: loc(PASSWORD_REQUIREMENTS_KEYS.complexity[key as ComplexityKeys], 'login', [value]),
      });
    } else if (value > 0 || value === true) {
      const item: ListItem = {
        ruleKey: key,
        label: loc(PASSWORD_REQUIREMENTS_KEYS.complexity[key as ComplexityKeys], 'login'),
      };
      items.push(item);
    }
  });

  return items;
};

export const getAgeItems = (age?: AgeRequirements): ListItem[] => {
  const items: ListItem[] = [];

  if (!age) {
    return items;
  }

  if (age.historyCount > 0) {
    items.push({
      ruleKey: 'historyCount',
      label: loc(PASSWORD_REQUIREMENTS_KEYS.age.historyCount, 'login', [age.historyCount]),
    });
  }

  if (age.minAgeMinutes > 0) {
    const { unitLabel, value } = getAgeFromMinutes(age.minAgeMinutes);

    items.push({
      ruleKey: 'minAgeMinutes',
      label: loc(unitLabel, 'login', [value]),
    });
  }

  return items;
};

// eslint-disable-next-line arrow-body-style
export const buildPasswordRequirementListItems = (data: PasswordSettings): ListItem[] => {
  return getComplexityItems(data.complexity);
};
