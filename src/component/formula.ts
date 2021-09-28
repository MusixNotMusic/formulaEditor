import coreModule from '../core_module';
import _ from 'lodash';
import $ from 'jquery';
import Sortable, { MultiDrag, Swap } from 'sortablejs';
import { parser }  from '../lexer/cal.js';
import { inputElementCharByPosition, getPosition, strlen} from '../util/dom';
import {
  // getACompositeFactor,
  getAConstantsFactor,
  getANoneFactor,
  getAOperatorFactor,
  getAParamFactor
} from '../util/interface';
const templateHtml = `
<div class="wrap" ng-mouseover="ctrl.fadeIn = 1" ng-mouseleave="ctrl.fadeIn = 2">
    <div class="ty-metrics-content-formula" ng-click="ctrl.metricsFormulaFocus($event)">
        <ul class="factor-list">
            <li ng-repeat="(index, factor) in ctrl.currentContext" ng-style="ctrl.itemStyle">
                <div ng-if="factor.type === 'none'" class="factor-input">
                  <input autocomplete="something-new" 
                    ng-model="factor.text" 
                    ng-keydown="ctrl.keydownFormulaText(factor.text, index, $event)"
                    ng-focus="ctrl.focusFormulaInput(index, factor, $event)"
                    ng-blur="ctrl.blurFormulaInput(index, factor, $event)"
                    ng-change="ctrl.inputFormulaText(factor, index)" 
                    ng-click="$event.stopPropagation();"
                    spellcheck="true"
                    class="formula-input" 
                    ng-class="{ 'underscore': ctrl.focusPos === index }"
                    ng-style="factor.style">
                    <!-- 下拉 -->
                    <div ng-if="factor.focus" class="formula-select-dropdown">
                          <ul ng-repeat="(index, item) in ctrl.searchLists | filter:ctrl.formulaSelectSearchFilter(factor.text)" class="formula-select-dropdown-menu">
                              <li  ng-mousedown="$event.preventDefault();" ng-click="ctrl.formulaSelectSearchClick(item, factor, $event)" class="formula-select-dropdown-menu-item">{{item.text}}</li>
                          </ul>
                    </div>
                </div>
                <div ng-if="factor.type === 'operator'" class="factor-input">
                  <input autocomplete="something-new" 
                    ng-model="factor.text" 
                    ng-keydown="ctrl.keydownFormulaText(factor.text, index, $event)"
                    ng-focus="ctrl.focusFormulaInput(index, factor, $event)"
                    ng-change="ctrl.inputFormulaText(factor, index)" 
                    ng-click="$event.stopPropagation();"
                    ng-blur="ctrl.blurFormulaInput(index, factor, $event)"
                    spellcheck="true"
                    class="formula-input"
                    ng-class="{ 'underscore': ctrl.focusPos === index }"
                    ng-style="factor.style" 
                  >
                  <!-- 下拉 -->
                  <div ng-if="factor.focus" class="formula-select-dropdown">
                        <ul ng-repeat="(index, item) in ctrl.searchLists | filter:ctrl.formulaSelectSearchFilter(factor.text)" class="formula-select-dropdown-menu">
                            <li  ng-mousedown="$event.preventDefault();" ng-click="ctrl.formulaSelectSearchClick(item, factor, $event)" class="formula-select-dropdown-menu-item">{{item.text}}</li>
                        </ul>
                  </div>
                </div>

                
                <div ng-if="factor.type === 'const'" class="factor factor-const">
                    <span class="factor-const">{{factor.text}}</span>
                    <div ng-click="ctrl.removeAParamFactor(index, $event)">
                      <i class="fa fa-times icon-pos"></i>
                    </div>
                </div>
                <div ng-if="factor.type === 'param'" class="factor factor-id" ng-click="ctrl._renameClickFormula(factor, $event)" ng-dblclick="ctrl.dblclickFormula(factor, $event)">
                    <span ng-show="factor.mode === 'show'" class="factor-param">{{factor.text}}</span>
                    <div ng-click="ctrl.removeAParamFactor(index, $event)">
                      <i class="fa fa-times icon-pos"></i>
                    </div>
                    <input autocomplete="something-new" 
                      ng-model="factor.editText" 
                      ng-show="factor.mode === 'edit'"
                      ng-keydown="ctrl.keydownParmaFormulaText(factor, $event)"
                      ng-blur="ctrl.blurParmaFormulaConfirm(factor)"
                      ng-change="ctrl.inputParmaFormulaText(factor)" 
                      ng-click="$event.stopPropagation();"
                      spellcheck="true"
                      class="rename-input"
                      ng-style="factor.style" 
                    >
                </div>
                <div ng-if="factor.type === 'composite'" class="factor factor-composite" ng-click="ctrl.clickOpenCompositeFactor(factor)">
                    <span class="factor-composite">{{factor.text}}</span>
                    <i class="fa fa-times icon-pos" ng-click="ctrl.removeAParamFactor(index, $event)"></i>
                </div>
            </li>
            <li ng-style="ctrl.itemStyle">
                <input autocomplete="something-new" 
                    ng-model="ctrl.formulaTail.text" 
                    ng-keydown="ctrl.keydownFormulaText(ctrl.formulaTail.text, -1, $event)"
                    ng-change="ctrl.inputFormulaText(ctrl.formulaTail, -1)" 
                    ng-focus="ctrl.focusFormulaInput(-1, ctrl.formulaTail, $event)"
                    ng-blur="ctrl.blurFormulaInput(-1, ctrl.formulaTail, $event)"
                    spellcheck="true"
                    class="formula-input formula-tail" 
                    ng-class="{ 'underscore': ctrl.focusPos === -1 && ctrl.parseResult.status !== 'error'}"
                    ng-style="ctrl.formulaTail.style">
                <span ng-if="ctrl.parseResult.status === 'error'" ng-style="ctrl.formulaTail.errorPos" class="formula-parse-error">^</span>
                <!-- 下拉 -->
                <div ng-if="ctrl.formulaTail.focus" class="formula-select-dropdown">
                      <ul ng-repeat="(index, item) in ctrl.searchLists | filter:ctrl.formulaSelectSearchFilter(ctrl.formulaTail.text)" class="formula-select-dropdown-menu">
                          <li  ng-mousedown="$event.preventDefault();" ng-click="ctrl.formulaSelectSearchClick(item, ctrl.formulaTail, $event)" class="formula-select-dropdown-menu-item">{{item.text}}</li>
                      </ul>
                </div>
            </li>
        </ul>
    </div>
    <div class="formula-undo" ng-class="{'fade-in':  ctrl.fadeIn === 1, 'fade-out': ctrl.fadeIn === 2}" ng-click="ctrl.undoClick();" ng-show="ctrl.undoStack.length > 1">
        <div class="formula-undo-wrap">
          <i class="fa fa-arrow-left"></i> 
        </div>
    </div>
</div>
<div style="margin-top:30px;"><span style="color: #db4515;">History Stack:</span> {{ctrl.undoStack | json}}</div>
<div style="margin-top:20px;"><span style="color: #db4515;">Parse Object:</span>  {{ctrl.parseResult | json}}</div>
`;
Sortable.mount(new MultiDrag(), new Swap());
declare const window: any;
// declare const document: any;
enum Factor { id = 'id', operator = 'operator', number = 'number'};
enum Status { error = 'error', accept = 'accept'};
export class BpiMetricCtrl {
  formula: any;
  focusPos: number;
  elem: any;
  scope: any;
  // input
  originString: string; //操作串
  itemStyle: string;
  // output
  clickItem: any;
  searchList: any;
  parsed: any;
  undoStack: Array<any>; //回撤栈
  currentContext: Array<any>;
  formulaTail: any;
  lexerPaser: any;
  parseResult: any;
  fadeIn = 0;

  _renameClickFormula: any;
  // _blurFormulaInput: any;

  searchLists = [
    {text: 'about',     value: 1},
    {text: 'boom',      value: 2},
    {text: 'cloud',     value: 3},
    {text: 'dance',     value: 4},
    {text: 'excellent', value: 5},
    {text: 'flower',    value: 6},
    {text: 'glass',     value: 7},
  ]
  _searchLists: any;
  
  /** @ngInject */
  constructor($element, $scope) {
    this.elem = $element;
    this.scope = $scope;
    this.formula = [];
    this.currentContext =[];
    this.originString = this.originString || '';
    this.undoStack = [];
    this.lexerPaser = parser;
    this.parseResult = { noMatchContext: '' };
    this.formulaTail = {style: '11px', text: '', focus: false};
    this.focusPos = -1;
    // window.lexerParser = parser;
    window.temp1 = this;
    // window.jQuery = $;
    // window.$ = $;
    // 节流
    // var el = document.getElementById('items');
    // var sortable =Sortable.create(el, {
    //   filter: '.static',
    //   swap: true, // Enable swap plugin
    //   swapClass: 'highlight', // The class applied to the hovered swap item
    //   animation: 150,
    //   onMove: function (/**Event*/evt, /**Event*/originalEvent) {
    //     // console.log('Sortable onMove ==>', evt, originalEvent);
    //   },
    //   onChange: function(/**Event*/evt) {
    //     // most likely why this event is used is to get the dragging element's current index
    //     // same properties as onEnd
    //     // console.log('onChange -->', evt, evt.newIndex);
    //   }
    // });
    // window.sortable = sortable;
    this._searchLists = this.searchLists;
    this._renameClickFormula = _.debounce(this.renameClickFormula, 300);
    // this._blurFormulaInput = _.debounce(this.blurFormulaInput , 10);
    this.patchLexer();
    let formula = 'asd/123-asd';
    this.addFormulaText(formula, -1);
  }

  

  // formula 公式输入
  keydownFormulaText(text, index, event) {
    if(text === void 0) return;
    text = text.trim();
    // backspace
    if (event.keyCode === 8) {
      if (index === -1) {
        this.removeFormulaTailText(event);
      } else {
        this.removeFormulaText(event, index);
      }
      // enter
    } else if (event.keyCode === 13) {
        this.addFormulaText(text, index);
      // ArrowLeft
    } else if (event.keyCode === 37) {
      this.moveLeftFormulaText(event, index);
      // ArrowRight
    } else if (event.keyCode === 39) {
      this.moveRightFormulaText(event, text, index);
    }
  }
  // 输入
  // index < 0 add type >= 0 修改
  inputFormulaText(formula, index, event?) {
    // console.log('inputFormulaText ==>', formula, index, event);
    let text = formula.text.trim();
    // const operatorReg = /^(\+|\-|\*|\/|\(|\))$/;
    // 判断 字符串长度
    if (text.length > 0) {
      let size = strlen(text) ;
      let len = size > 0 ? size * 8 + 3 : 11 ;
      formula.style = { width: `${len}px` };
    } else {
      if (index >= 0) {
        this.currentContext[index] = getANoneFactor();
        this.focusBack(index - 1);
      }
      formula.style = { width: '11px' };
    }
    // 点击选项之后， 再次操作，重新focus
    formula.focus = true;
  }

  formulaSelectSearchFilter(text) {
    return (item) => {
        if(text == '') return true;
        return _.includes(item.text, text);
    }
  }

  formulaSelectSearchClick(item, factor, event: Event) {
    this._renameClickFormula.cancel();
    console.log('formulaSelectSearchClick', item, factor, event);
    factor.text = item.text;
    factor.focus = false;
    let size = strlen(factor.text ) ;
    let len = size > 0 ? size * 8 + 5 : 11 ;
    factor.style = { width: `${len}px` };
    event.preventDefault();
  }

  setInputLength(formula, text) {
    text = text.trim();
    if (text.length > 0) {
      let size = strlen(text) ;
      let len = size > 0 ? size * 8 + 5 : 8;
      formula.style = { width: `${len}px` };
    } else {
      formula.style = { width: '8px' };
    }

  }


  //聚焦
  focusFormulaInput(index, factor) {
    console.log('focusFormulaInput');
    this.focusPos = index;
    factor.focus = true;
  }

  blurFormulaInput(index, factor, event: Event) {
    console.log('blurFormulaInput');
    this.focusPos = index;
    factor.focus = false; 
      // setTimeout(() => { 
      //   console.log('blurFormulaInput');
      //   this.formulaTail.focus = false; 
      // }, 0);
    event.preventDefault();
    event.stopPropagation();
  }

  addFormulaText(text, index : number) {
    console.log('addFormulaText ==>', text, index);
    if(!_.isString(text)) {
      return;
    }
    this.originString = this.insertFullContext(text, index);
    if(_.isString(this.originString)) {
      this.pushUndoStack({text: this.originString, focusPos: this.focusPos});
    }
    this.parse(this.originString);
    // this.render();
  }

  insertFullContext(text: string, index : number) {
    if(index < 0) {
      this.currentContext.push({text: text, type:'temp'});
    }
    return _.join(_.map(this.currentContext, item => item.text), '');
  }

  getFullContext() {
    return _.join(_.map(this.currentContext, item => item.text), '');
  }

  dblclickFormula(factor, event: Event) {
    console.log('dblclickFormula');
    this._renameClickFormula.cancel();
    if(this.clickItem) {
      this.clickItem(factor);
    }
    event.stopPropagation();
  }

  renameClickFormula(factor, event) {
    if(factor.id < 0) {
      factor.editText = factor.text;
      factor.mode = 'edit';
      this.setInputLength(factor, factor.editText);
      this.scope.$apply(() => {
        setTimeout(() => {
          $(event.target).parent().find('input').focus() 
        },50);
      });
    }
    event.stopPropagation();
    event.preventDefault();
  }

  keydownParmaFormulaText(factor, event) {
    if(event.keyCode === 13) {
      this.blurParmaFormulaConfirm(factor);
      event.preventDefault();
    }
  }

  inputParmaFormulaText(factor) {
    let idReg = /^[A-Za-z_\u4E00-\u9FA5]+$/;
    let editText = factor.editText.trim();
    this.setInputLength(factor, factor.editText);
    if(!idReg.test(editText)) {
      factor.style.border = "2px solid orangered";
    } else {
      delete factor.style.border;   
    }
  }

  blurParmaFormulaConfirm(factor) {
    factor.mode = 'show';
    let idReg = /^[A-Za-z_\u4E00-\u9FA5]+$/;
    let text = factor.editText.trim();
    if(_.isString(text) && idReg.test(text)) {
      factor.text = factor.editText;
      this.addFormulaText('', -1);
    }
  }


  render(){
    if(!_.isEmpty(this.parseResult)) {
      if (this.parseResult.status === Status.error) {
        let size = strlen(this.parseResult.noMatchContext) ;
        let len = size > 0 ? size * 8 + 3 : 11 ;
        this.formulaTail.style = { width:  `${len}px` };
        this.formulaTail.text = this.parseResult.noMatchContext;
        let formulaTailDom = $(this.elem).find('.formula-tail')[0];
        let leftPixel = size > 0 ? inputElementCharByPosition(formulaTailDom, 0).inputOffsetX : 4;
        this.formulaTail.errorPos = { left :`${leftPixel}px` };
        // $(this.elem).find('.formula-parse-error').css('left', inputElementCharByPosition(formulaTailDom, 0).inputOffsetX);
      } else {
        this.formulaTail.style = { width: '11px' };
        this.formulaTail.text = '';
      }
    }
  }
  // 添加公式
  // 删除公式

  /**
   *
   * @param {*} event 事件
   * @param {*} text  输入的文本
   * @param {*} index 删除的索引
   *
   * input删除
   *  1. 如果input中没内容，删除 前一个tags
   *  2. input中有内容 并且 光标在 第一个位置 删除 前一个 tags， 否则删除 input中的内容
   *  3. 如果是 参数 直接删除
   */
  removeFormulaText(event, index) {
    // 有最后的tailInput 不保留input
    if (this.currentContext.length === 0) {
      return;
    }
    /**
     * |p|none|p|none|p|
     * |o|p|none|p|
     *  删除none 删除自己和前一个param 并且 重新focus
     */
      let position = getPosition(event.target);
      let removeCount = 0;
      if (position === 0 && index > 0) {
        this.currentContext.splice(index-1, 1);
        removeCount++;
        if(index === 2) {
          this.currentContext.splice(0, 1)
          removeCount++;
        }
        this.focusPos = index - removeCount;
        this.focusIndex(index - removeCount);
      }
  }

  removeFormulaTailText(event) {
    if (this.currentContext.length === 0) {
      return;
    }

    let position = getPosition(event.target);
    if (position === 0) {
      this.currentContext.pop();
      if(this.currentContext.length === 1) {
        this.currentContext.pop();
      }
    }
  }

  
  // 直接删除 一个 参数因子
  removeAParamFactor(index, event: Event) {
    event.stopPropagation();
    console.log('removeAParamFactor');
    let contexts = this.currentContext;
    if (contexts.length === 0) {
      return;
    }
    contexts.splice(index, 1);
    // 删除 空参数
    this.focusPos = index;
    this.focusBack(index);
    // event.preventDefault();
  }

  // 向左移动
  moveLeftFormulaText(event, index) {
    let factor;
    let pos = getPosition(event.target);
    let len = this.currentContext.length;
    index = index === -1 ? len : index;
    while (pos === 0 && --index >= 0) {
      factor = this.currentContext[index];
      if (factor.elmType === 'input') {
        break;
      }
    }
    if (pos === 0 && index >= 0) {
      let dom = $(this.elem).find('.ty-metrics-content-formula ul').children()[index];
      $(dom)
        .find('input')
        .focus();
      this.focusPos = index;
    } else if (index < 0) {
      this.forceFocusMoveTail();
    }
  }
  // 向右移动
  moveRightFormulaText(event, text, index) {
    let factor;
    let pos = getPosition(event.target);
    let len = this.currentContext.length;
    let size = 0;
    if(!_.isEmpty(text)){
      size = text.length;
    }

    if (pos === size || (pos === 0 && text.trim().length === 0)) {
      while (++index < len) {
        factor = this.currentContext[index];
        if (factor.elmType === 'input') {
          break;
        }
      }
    }
    if (index < len) {
      // let dom = $(this.elem).find('.ty-metrics-content-formula ul>li')[index];
      let dom = $(this.elem).find('.ty-metrics-content-formula > ul').children()[index];
      $(dom)
        .find('input')
        .focus();
      this.focusPos = index;
    } else {
      $(this.elem).find('.ty-metrics-content-formula .formula-tail').focus();
      this.focusPos = -1;
    }
  }

  forceFocusMoveTail() {
    // $('#ty_bpi_metrics .ty-metrics-content-formula .formula-tail').focus();
    $(this.elem).find('.ty-metrics-content-formula .formula-tail').focus();
  }
  // 聚焦到前一个input
  focusForward(pos) {
    let i = pos;
    let factors = this.currentContext;
    while (i >= 0) {
      if (factors[i].elmType === 'input') {
        break;
      }
      --i;
    }
    if (i >= 0) {
      setTimeout(() => {
        // $($('#ty_bpi_metrics .ty-metrics-content-formula li')[i])
        //   .find('input')
        //   .focus();
        $($(this.elem).find('.ty-metrics-content-formula li')[i])
          .find('input')
          .focus();
      });
    }
  }
  // 聚焦到后一个input
  focusBack(pos) {
    let i = pos;
    let factors = this.currentContext;
    let len = factors.length;
    while (i < len) {
      if (factors[i] && factors[i].elmType === "input") {
        break;
      }
      i++;
    }
    window.setTimeout(() => {
      if (i < len) {
        // $($('#ty_bpi_metrics .ty-metrics-content-formula li')[i])
        //   .find('input')
        //   .focus();
        $($(this.elem).find('.ty-metrics-content-formula>ul>li')[i])
          .find('input')
          .focus();
      } else {
        this.forceFocusMoveTail();
      }
    });
  }

  focusIndex(index) {
    let dom = $(this.elem).find('.ty-metrics-content-formula>ul>li').eq(index).find('.input');
    if(dom) {
      dom.focus();
    } else {
      this.forceFocusMoveTail();
    }
  }

  // 点击公式编辑 聚焦到 尾部input上
  metricsFormulaFocus(event) {
    event.preventDefault();
    event.stopPropagation();
    if(this.focusPos < 0) {
    let dom = $(this.elem).find('.formula-tail');
      if (dom) {
        dom.focus();
      }
    } else {
      $(this.elem).find('.ty-metrics-content-formula>ul>li').eq(this.focusPos).find('input').focus();
    }
    event.preventDefault();
  }

  // 推入栈
  pushUndoStack(input){
    let top = this.undoStack[this.undoStack.length - 1];
    if (_.isEmpty(top) || !_.isEqual(top.text, input.text)) {
      this.undoStack.push(input);
    }
  }
  // 弹出栈 
  popUndoStack() {
    let top = null;
    if (this.undoStack.length > 1) {
      this.undoStack.pop();
      if(this.undoStack.length > 0) {
        top = this.undoStack[this.undoStack.length - 1];
      }
    }
    return top;
  }

  patchLexer() {
    this.lexerPaser.yy.parseError =  (str, hash) => {
      console.log('lexer patchLexer ==>',this.lexerPaser.yy.matchedList, hash);
      // 出现词法解析错误时候, 指向前一个
      // if(this.lexerPaser.yy.matchedList.length >= 1) {
      //   this.lexerPaser.yy.matchedList.pop();
      // }
      // nomatch context
      let noMatchContext = '';
      if ( _.isEmpty(hash) || _.isEmpty(hash.loc) ) {
        let len = _.join(_.map(this.lexerPaser.yy.matchedList, item => item.text), '').length;
        noMatchContext = this.originString.substr(len);
      } else {
        this.lexerPaser.yy.matchedList.pop();
        noMatchContext = this.originString.substr(hash.loc.last_column)
      }
      this.parseResult = {
        context: this.lexerPaser.yy.matchedList,
        msg: str,
        status: 'error',
        noMatchContext: noMatchContext,
        text: this.originString
      }
      this.setCurrentContext(this.lexerPaser.yy.matchedList);
      this.render();
      throw str;
    };
  }

  parse(input) {
    this.lexerPaser.yy.matchedList = [];
    console.log('lexer parse ==>');
    if(this.lexerPaser.parse(input) === 'accept') {
      if(this.lexerPaser.yy.matchedList.length >= 1) {
        this.lexerPaser.yy.matchedList.pop();
      }
      this.parseResult = {
        context: this.lexerPaser.yy.matchedList,
        status: 'accept',
        text: this.originString
      }
      this.setCurrentContext(this.lexerPaser.yy.matchedList);
      this.render();
    }
  }

  setCurrentContext(matchedList) {
    let list = _.cloneDeep(_.filter(matchedList, item => !_.isEmpty(item.text)));
    this.currentContext = [];
     _.forEach(list, this.createFormulaView.bind(this))
  }

    // 添加公式
  /**
   *
   * @param {*} item
   * @param {*} index
   */
  createFormulaView(item, index) {
    let text = item.text;
    let type = item.type;
    // const operatorReg = /^(\+|\-|\*|\/|\(|\))$/;
    // const numberReg = /^(\d+)$/;
    if (_.isEmpty(text)) {
      return;
    }
    if(index === 0 && type !== Factor.operator) {
      this.currentContext.push(getANoneFactor(index))
    }
    if (type === Factor.operator) {
      this.currentContext.push( getAOperatorFactor(text, index));
    } else if (type === Factor.number) {
      this.currentContext.push( getAConstantsFactor(text, index));
    } else if (type === Factor.id){
      let id = -1;
      if(this.searchList) {
        let item = _.find(this.searchLists, (item) => { return text === item.text});
        if(item) {
          id = item.value;
        }
      }
      this.currentContext.push( getAParamFactor(text, index, id));
    }else {
      this.currentContext.push( getANoneFactor());
    }
    // this.formulaTail.placeholder = '';
  }

  undoClick() {
   let top: any = this.popUndoStack();
   console.log('undoClick ==>', top);
   if(top && _.isString(top.text)) {
     this.originString = top.text;
     this.focusPos = top.focusPos;
     this.parse(this.originString);
   }
  }
}

export function BpiMetricDirective() {
  return {
    restrict: 'E',
    template: templateHtml,
    controller: BpiMetricCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    transclude: true,
    scope: { 
      originString: '=initString', 
      itemStyle: '=itemStyle', 
      clickItem: '=', 
      searchList: '=', 
      parsed: '='
    },
    link: function(scope, elem) {
      scope.elem = elem;
    }
  };
}

coreModule.directive('tyFormulaEditor', BpiMetricDirective);
