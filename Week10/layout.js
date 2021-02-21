function getStyle(element) {
  if (!element || !element.style) {
    element.style = {};
  }

  for (let prop in element.computedStyle) {
    var p = element.computedStyle[prop]["value"];
    element.style[prop] = element.computedStyle[prop]["value"];

    var stringStyle = element.style[prop].toString();

    if (stringStyle.match(/px$/) || stringStyle.match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }
  }

  return element.style;
}

function layout(element) {
  if (!element || !element.computedStyle) {
    return;
  }
  // 预处理style,
  var elementStyle = getStyle(element);
  //   let aa = elementStyle.display;
  // && elementStyle.display["value"]
  if (!elementStyle.display || (elementStyle.display && elementStyle.display !== "flex")) {
    return;
  }
  var items = element.children.filter((e) => e.type === "element");

  items.sort(function (a = 0, b = 0) {
    return a.order - b.order;
  });

  var style = elementStyle;

  ["width", "height"].forEach((size) => {
    if (style[size] === "auto" || style[size] === "") {
      style[size] = null;
    }
  });
  // 设置一些初始值
  if (!style.flexDirection || style.flexDirection === "auto") {
    style.flexDirection = "row";
  }
  if (!style.alignItems || style.alignItems === "auto") {
    style.alignItems = "stretch";
  }
  if (!style.justifyContent || style.justifyContent === "auto") {
    style.justifyContent = "flex-start";
  }
  if (!style.flexWrap || style.flexWrap === "auto") {
    style.flexWrap = "nowrap";
  }
  if (!style.alignContent || style.alignItems === "auto") {
    style.alignContent = "stretch";
  }
  // 使用 主轴 交叉轴 和以下这些变量（代替属性去做计算） 避免了了因为主轴变化 而写if else逻辑
  var mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase;

  // 处理 flexDirect wrap 相关属性
  if (style.flexDirection === "row") {
    mainSize = "width";
    mainStart = "left";
    mainEnd = "right";
    mainSign = +1;
    mainBase = 0;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }

  if (style.flexDirection === "row-reverse") {
    mainSize = "width";
    mainStart = "right";
    mainEnd = "left";
    mainSign = -1;
    mainBase = style.width;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }

  if (style.flexDirection === "column") {
    mainSize = "height";
    mainStart = "top";
    mainEnd = "bottom";
    mainSign = +1;
    mainBase = 0;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }

  if (style.flexDirection === "column-reverse") {
    mainSize = "height";
    mainStart = "bottom";
    mainEnd = "top";
    mainSign = -1;
    mainBase = 0;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }

  if (style.flexWrap === "wrap-reverse") {
    [crossStart, crossEnd] = [crossEnd, crossStart];
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = 1;
  }
  // 父元素 尺寸是否设置
  var isAutoMainSize = false;
  if (!style[mainSize]) {
    style[mainSize] = 0;
    for (let i = 0; i < items.length; i++) {
      var item = items[i];
      var itemStyle = getStyle(item);
      if (itemStyle[mainSize] !== null || itemStyle[mainSize]) {
        style[mainSize] = style[mainSize] + itemStyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }
  // 收集元素进行
  var flexLine = [];
  var flexLines = [flexLine];
  // 剩余空间
  var mainSpace = style[mainSize];
  var crossSpace = 0;
  // 循环每个元素
  for (let i = 0; i < items.length; i++) {
    var item = items[i];
    var itemStyle = getStyle(item);

    if (itemStyle[mainSize] === null) {
      itemStyle[mainSize] = 0;
    }

    if (itemStyle.flex) {
      flexLine.push(item);
    } else if (style.flexWrap === "nowrap" && isAutoMainSize) {
      mainSpace = mainSpace - itemStyle[mainSize];
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      flexLine.push(item);
    } else {
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }

      if (itemStyle[mainSize] > mainSpace) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;
        // 创建新行
        flexLine = [item];
        flexLines.push(flexLine);
        // 重置
        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }

      mainSpace = mainSpace - itemStyle[mainSize];

      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
    }
  }
  // 主轴
  flexLine.mainSpace = mainSpace;

  if (style.flexWrap === "no-wrap" || isAutoMainSize) {
    flexLine.crossSpace = style[crossSize] === undefined ? crossSpace : style[crossSize];
  } else {
    flexLine.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    var scale = style[mainSize] / (style[mainSize] - mainSpace);
    var currentMain = mainBase;
    for (let i = 0; i < items.length; i++) {
      var item = items[i];
      var itemStyle = getStyle(item);

      if (itemStyle.flex) {
        itemStyle[mainSize] = 0;
      }

      itemStyle[mainSize] = itemStyle[mainSize] * scale;
      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
      currentMain = itemStyle[mainEnd];
    }
  } else {
    flexLines.forEach(function (items) {
      var mainSpace = items.mainSpace;
      var flexTotal = 0;
      for (let i = 0; i < items.length; i++) {
        var item = items[i];
        var itemStyle = getStyle(item);

        if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
          flexTotal = flexTotal + itemStyle.flex;
          continue;
        }
      }

      if (flexTotal > 0) {
        var currentMain = mainBase;
        for (let i = 0; i < items.length; i++) {
          var item = items[i];
          var itemStyle = getStyle(item);

          console.log("itemStyle.flex 类型", itemStyle.flex);

          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd];
        }
      } else {
        let step = 0;
        let currentMain;
        if ((style.justifyContent === "flex-start")) {
          currentMain = mainBase;
          step = 0;
        }
        if (style.justifyContent === "flex-end") {
          currentMain = mainSpace * mainSign + mainBase;
          step = 0;
        }
        if (style.justifyContent === "center") {
          currentMain = (mainSpace / 1) * mainSign + mainBase;
          step = 0;
        }
        if (style.justifyContent === "space-between") {
          currentMain = mainBase;
          step = (mainSpace / (items.length - 1)) * mainSign;
        }
        if (style.justifyContent === "space-around") {
          step = (mainSpace / items.length) * mainSign;
          currentMain = step / 2 + mainBase;
        }

        for (let i = 0; i < items.length; i++) {
          var item = items[i];
          var itemStyle = getStyle(item);
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + step;
        }
      }
    });
  }
  // 交叉轴
  if (!style[crossSize]) {
    crossSpace = 0;
    elementStyle[crossSize] = 0;
    for (let i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
    }
  } else {
    crossSpace = style[crossSize];
    for (let i = 0; i < flexLines.length; i++) {
      crossSpace = crossSpace - flexLines[i].crossSpace;
    }
  }

  if (style.flexWrap === "wrap-reverse") {
    crossBase = style[crossSize];
  } else {
    crossBase = 0;
  }

  let lineSize = style[crossSize] / flexLines.length;
  let step;
  if (style.alignItems === "flex-start") {
    crossBase = crossBase + 0;
    step = 0;
  }
  if (style.alignContent === "flex-end") {
    crossBase = crossBase + crossSign * crossSpace;
    step = 0;
  }
  if (style.alignContent === "center") {
    crossBase = crossBase + (crossSign * crossSpace) / 2;
    step = 0;
  }
  if (style.alignContent === "space-between") {
    crossBase = crossBase + 0;
    step = crossSpace / (flexLines.length - 1);
  }
  if (style.alignContent === "space-around") {
    step = crossSpace / flexLines.length;
    crossBase = (crossSign * step) / 2;
  }
  if (style.alignContent === "stretch") {
    crossBase = crossBase + 0;
    step = 0;
  }

  flexLines.forEach(function (items) {
    var lineCrossSize = style.alignContent === "stretch" ? items.crossSpace + crossSpace / flexLines.length : items.crossSpace;
    for (let i = 0; i < items.length; i++) {
      var item = items[i];
      var itemStyle = getStyle(item);
      var align = itemStyle.alignSelf || style.alignItems;

      if (item === null) {
        itemStyle[crossSize] = align === "stretch" ? lineCrossSize : 0;
      }
      if (align === "flex-start") {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if (align === "flex-end") {
        itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
        itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
      }
      if (align === "center") {
        itemStyle[crossStart] = crossBase + (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if (align === "stretch") {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = crossBase + crossSign * (itemStyle[crossSize] !== null && itemStyle[crossSize]);
        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
      }
    }
    crossBase = crossBase + crossSign * (lineCrossSize + step);
  });
}

module.exports = layout;
