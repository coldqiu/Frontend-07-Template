// 处理参数selector字符串，简单选择器、符合选择器、复杂选择器、
// 想到 词法分析 产生式 KMP LL 四则运算
// 简单选择器：
/**
 * 简单选择器：
 * *
 * div svg|a
 * .class
 * #id
 * [attr=value]
 * :hover
 * ::before
 * 选择器语法
 *  复合选择器
 *      <简单选择器> <简单选择器> <简单选择器>
 *      *或者 div必须写在最前面
 *  复杂选择器
 *      用各种符号连接复合选择器
 *      <space> > ~ + ||
 *      例如 <复合选择器> ">" <复合选择器>
 * @param {*} selector
 * @param {*} element
 */
function match(selector, element) {
  return true;
}

match("div #id.class", document.getElementById("id"));

// 对selector做词法分析
// 把问题想复杂了，还是有简洁的方法
// 记不住的正则
var regexp;
var dictionary;

function tokenize(source) {}
