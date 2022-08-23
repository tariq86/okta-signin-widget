/* eslint max-len: [2, 140] */
import { loc } from 'okta';
import OAuth2Util from 'util/OAuth2Util';
import Util from 'util/Util';
import getAuthClient from 'widget/getAuthClient';
import Settings from 'models/Settings';
import { AuthSdkError, OAuthError } from '@okta/okta-auth-js';
import Enums from 'util/Enums';
import { OAuthError } from 'util/Errors';
import { NonRecoverableError } from 'util/OAuthErrors';



describe('util/OAuth2Util', function() {
  class MockModel {
    constructor() {
      this.trigger = jest.fn();
      this.appState = { trigger: jest.fn() };
    }
  }

  class MockController {
    constructor() {
      this.model = new MockModel();
      this.trigger = function() {};
    }
  }
  describe('getTokens', function() {
    let controller;
    let authClient;
    let settings;

    beforeEach(function() {
      controller = new MockController();
      authClient = getAuthClient({
        authParams: { issuer: 'https://foo/default' }
      });
      settings = new Settings({
        baseUrl: 'https://foo'
      });
      settings.setAuthClient(authClient);
    });

    it('exists', () => {
      expect(OAuth2Util.getTokens).toBeTruthy();
    });

    it('emits SDK errors through \'triggerAfterError\' event', function(done) {
      spyOn(authClient.token, 'getWithPopup').and.callFake(function() {
        return new Promise(function() {
          throw new AuthSdkError('Auth SDK error');
        });
      });

      return new Promise(function(resolve) {
        spyOn(Util, 'triggerAfterError').and.callFake(resolve);
        OAuth2Util.getTokens(settings, {}, controller);
      }).then(function() {
        expect(Util.triggerAfterError).toHaveBeenCalledTimes(1);
        const exceptionMessage = Util.triggerAfterError.calls.mostRecent().args[1].message;
        expect(exceptionMessage).toEqual('Auth SDK error');
        done();
      }).catch(done.fail);
    });

    it('calls globalError function when encountering non-recoverable error', function(done) {
      spyOn(authClient.token, 'getWithPopup').and.callFake(function() {
        return new Promise(function() {
          throw new OAuthError(
            'login_required', 'The client specified not to prompt, but the client app requires re-authentication or MFA.');
        });
      });

      return new Promise(function(resolve) {
        spyOn(settings, 'callGlobalError').and.callFake(resolve);
        OAuth2Util.getTokens(settings, {}, controller);
      }).then(function() {
        expect(settings.callGlobalError).toHaveBeenCalledTimes(1);
        const exception= settings.callGlobalError.calls.mostRecent().args[0];
        expect(exception).toBeInstanceOf(NonRecoverableError);
        done();
      }).catch(done.fail);
    });

    it.each([
      'access_denied',
      'jit_failure_missing_fields',
      'jit_failure_invalid_login_format',
      'jit_failure_values_not_match_pattern',
      'jit_failure_values_too_long',
      'jit_failure_invalid_locale',
    ])('generates the proper error message for errorCode "%s"', function(errCode, done) {
      const errorMessage = 'Auth SDK error';
      const authException = new AuthSdkError(errorMessage);
      authException.errorCode = errCode;

      jest.spyOn(authClient.token, 'getWithPopup').mockImplementation(() => {
        return new Promise(function() {
          throw authException;
        });
      });

      return new Promise(function(resolve) {
        jest.spyOn(Util, 'triggerAfterError').mockImplementation(resolve);
        OAuth2Util.getTokens(settings, {}, controller);
      }).then(function() {
        expect(controller.model.trigger).toHaveBeenCalledTimes(1);
        if (errCode === 'access_denied') {
          expect(controller.model.trigger).toHaveBeenLastCalledWith('error', controller.model,
            { responseJSON: { errorSummary: errorMessage } });
        } else {
          expect(controller.model.trigger).toHaveBeenLastCalledWith('error', controller.model,
            { responseJSON: { errorSummary: loc('error.jit_failure', 'login') }});
        }
        expect(Util.triggerAfterError).toHaveBeenCalledTimes(1);
        expect(Util.triggerAfterError).toHaveBeenCalledWith(controller, new OAuthError(errorMessage), settings);
        done();
      }).catch(done.fail);
    });

    it('invokes \'globalSuccessFn\' after successfull token retrieval', function(done) {
      return new Promise(function(resolve) {
        spyOn(settings, 'callGlobalSuccess').and.callFake(resolve);
        spyOn(authClient.token, 'getWithPopup').and.callFake(function() {
          return Promise.resolve({token: 'foobar'});
        });
        OAuth2Util.getTokens(settings, {}, controller);
      }).then(function() {
        expect(settings.callGlobalSuccess).toHaveBeenCalledTimes(1);
        expect(settings.callGlobalSuccess).toHaveBeenCalledWith(Enums.SUCCESS, {token: 'foobar'});
        done();
      }).catch(done.fail);
    });

    it('gates non-allowlisted token parameters from widget config', function(done) {
      const settingsWithAdditionalParams = new Settings({
        baseUrl: 'https://foo',
        clientId: 'foobar',
        authOptions: {
          responseMode: 'token'
        }
      });
      settingsWithAdditionalParams.setAuthClient(authClient);

      return new Promise(function(resolve) {
        spyOn(authClient.token, 'getWithPopup').and.callFake(resolve);
        OAuth2Util.getTokens(settingsWithAdditionalParams, { scopes: ['openid'] }, controller);
      }).then(function() {
        const tokenParameters = Object.keys(authClient.token.getWithPopup.calls.mostRecent().args[0]);
        expect(tokenParameters).not.toContain('responseMode');
        expect(tokenParameters).not.toContain('baseUrl');
        expect(tokenParameters).toContain('clientId');
        expect(tokenParameters).toContain('scopes');
        done();
      }).catch(done.fail);
    });

    it('retrieves tokens through redirect when widget is configured with "redirect" = "always"', function(done) {
      const settingsWithRemediationMode = new Settings({
        baseUrl: 'https://foo',
        redirect: 'always',
      });
      settingsWithRemediationMode.setAuthClient(authClient);

      return new Promise(function(resolve) {
        spyOn(authClient.token, 'getWithRedirect').and.callFake(resolve);
        OAuth2Util.getTokens(settingsWithRemediationMode, {}, controller);
      }).then(function() {
        expect(authClient.token.getWithRedirect).toHaveBeenCalledTimes(1);
        done();
      }).catch(done.fail);
    });

    it('retrieves tokens via iframe when sessionToken is available', function(done) {
      return new Promise(function(resolve) {
        spyOn(authClient.token, 'getWithoutPrompt').and.callFake(resolve);
        OAuth2Util.getTokens(settings, { sessionToken: 'foo'} , controller);
      }).then(function() {
        expect(authClient.token.getWithoutPrompt).toHaveBeenCalledTimes(1);
        done();
      }).catch(done.fail);
    });
  });
});
