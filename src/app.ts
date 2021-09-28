import angular from  'angular';
import _ from 'lodash';
import { angularModules } from './core_module';

export class GrafanaApp {
    registerFunctions: any;
    ngModuleDependencies: any[];
    preBootModules: any;
  
    constructor() {
      this.preBootModules = [];
      this.registerFunctions = {};
      this.ngModuleDependencies = [];
    }
  
    useModule(module: angular.IModule) {
      if (this.preBootModules) {
        this.preBootModules.push(module);
      } else {
        _.extend(module, this.registerFunctions);
      }
      this.ngModuleDependencies.push(module.name);
      return module;
    }
  
  
    init() {
      const app = angular.module('app', []);
      app.config(
        (
          $locationProvider: angular.ILocationProvider,
          $controllerProvider: angular.IControllerProvider,
          $compileProvider: angular.ICompileProvider,
          $filterProvider: angular.IFilterProvider,
          $httpProvider: angular.IHttpProvider,
          $provide: angular.auto.IProvideService,
          $translateProvider,
        ) => {
          // pre assing bindings before constructor calls
          $compileProvider.preAssignBindingsEnabled(true);
          $httpProvider.useApplyAsync(true);
        
          this.registerFunctions.controller = $controllerProvider.register;
          this.registerFunctions.directive = $compileProvider.directive;
          this.registerFunctions.factory = $provide.factory;
          this.registerFunctions.service = $provide.service;
          this.registerFunctions.filter = $filterProvider.register;
  
          $provide.decorator('$http', [
            '$delegate',
            '$templateCache',
            ($delegate: any, $templateCache: any) => {
              const get = $delegate.get;
              $delegate.get = (url: string, config: any) => {
                if (url.match(/\.html$/)) {
                  // some template's already exist in the cache
                  if (!$templateCache.get(url)) {
                    url += '?v=' + new Date().getTime();
                  }
                }
                return get(url, config);
              };
              return $delegate;
            },
          ]);
        }
      );
  
      this.ngModuleDependencies = [
        'grafana.core',
        // 'ngInput'
        // 'ngRoute',
        // 'ngSanitize',
        // '$strap.directives',
        // 'ang-drag-drop',
        // 'grafana',
        // 'pasvaz.bindonce',
        // 'react',
      ];
  
      // makes it possible to add dynamic stuff
      _.each(angularModules, (m: angular.IModule) => {
        this.useModule(m);
      });
  
      // register react angular wrappers
      //   coreModule.config(setupAngularRoutes);
      //   registerAngularDirectives();
  
      // disable tool tip animation
    //   $.fn.tooltip.defaults.animation = false;
  
      // bootstrap the app
      angular.bootstrap(document, this.ngModuleDependencies).invoke(() => {
        _.each(this.preBootModules, (module: angular.IModule) => {
          _.extend(module, this.registerFunctions);
        });
  
        this.preBootModules = null;
      });
  
      // Preload selected app plugins
    //   for (const modulePath of config.pluginsToPreload) {
    //     importPluginModule(modulePath);
    //   }
    }
  }

  export default new GrafanaApp();