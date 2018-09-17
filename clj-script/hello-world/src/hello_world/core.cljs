(ns hello-world.core)
(println :started)

;; get editor
;; get stuff inside of editor

(defn getText
  "Get inner text of DOM element with ID [id]"
  [id]
  (let [elem (.getElementById js/document (str id))] elem.innerText))

;; do something like println that stuff
(println (getText ["editor"]))
; (fn [editor] (.innerText js/))
; (println editorText)
