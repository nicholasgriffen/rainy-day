// Compiled by ClojureScript 1.10.339 {}
goog.provide('hello_world.core');
goog.require('cljs.core');
cljs.core.println.call(null,new cljs.core.Keyword(null,"started","started",585705024));
/**
 * Get inner text of DOM element with ID [id]
 */
hello_world.core.getText = (function hello_world$core$getText(id){
var elem = document.getElementById([cljs.core.str.cljs$core$IFn$_invoke$arity$1(id)].join(''));
return elem.innerText;
});

//# sourceMappingURL=core.js.map
