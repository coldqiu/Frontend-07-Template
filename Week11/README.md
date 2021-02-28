学习笔记
问：为什么 first-letter 可以设置 float 之类的，而 first-line 不行呢？

答：first-letter 作用在第一个字符上，相对独立，
first-letter 作用在一个行所有元素上，与行相关，
float 属性会使元素脱离正常的文档流，所以只能设置一些行内、文本和颜色相关的属性；
