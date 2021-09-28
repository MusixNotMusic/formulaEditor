// 获取 空因子 数据
export function getANoneFactor(index?) {
    return {
        type: 'none',
        elmType: 'input',
        text: '',
        style: { width: '4px' },
        focus: false,
        pos: index
    };
}
// 获取 操作符 数据
export function  getAOperatorFactor(text, index?) {
    return {
        type: 'operator',
        elmType: 'input',
        text: text,
        style: { width: '11px' },
        focus: false,
        pos: index
    };
}
// 获取一个 参数
export function getAParamFactor(text, index?, id?) {
    return {
        type: 'param',
        elmType: 'block',
        text: text,
        show: false,
        mode: 'show',
        id: id || -1,
        pos: index,
        style: { width: '11px' },
    };
}
// 获取一个常量
export function getAConstantsFactor(text, index?) {
    return {
        type: 'const',
        elmType: 'block',
        text: text,
        pos: index
    };
}
// 获取一个插入 复合指标
export function getACompositeFactor(text, id, index?) {
    return {
        type: 'composite',
        elmType: 'block',
        text: text,
        id: id || -1,
        pos: index
    };
}