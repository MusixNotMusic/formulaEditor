import coreModule from '../core_module';
const templateHtml = `
    <h1> Test interface to formula-eidtor </h1>
    <ty-formula-editor init-string="ctrl.inputString" item-style="ctrl.itemStyle" click-item="ctrl.customClick" search-list="ctrl.searchList" parsed = "ctrl.parsed"></ty-formula-editor>
`;

class WrapCtrl {
    inputString: string;
    itemStyle: object;
    list = [
        {text: 'a', id: 0},
        {text: 'b', id: 1},
        {text: 'c', id: 2},
        {text: 'd', id: 3},
        {text: 'e', id: 4},
        {text: 'f', id: 5},
    ];
    scope: any;
    /** @ngInject */
    constructor($scope) {
        this.scope = $scope;
        this.inputString = '';
        this.itemStyle = { height: '26px'};
    }

    customClick(opt) {
        alert('customClick: '+JSON.stringify(opt));
    }

    searchList() {
        return new Promise((resolve, reject) => {
            resolve(this.list);
        })
    }

    parsed(opt) {
        console.log('parsed', opt);
    }
}
export function WrapDirective() {
    return {
      restrict: 'E',
      template: templateHtml,
      controller: WrapCtrl,
      bindToController: true,
      controllerAs: 'ctrl',
      scope: { 
        // originString: '=originString', 
        // itemHeight: '@itemHeight', 
        // clickItem: '&clickItem', 
        // searchList: '&searchList', 
        // parseStatus: '=parseStatus'
      },
      link: function(scope, elem) {
        scope.elem = elem;
      }
    };
  }
  
  coreModule.directive('wrapTest', WrapDirective);