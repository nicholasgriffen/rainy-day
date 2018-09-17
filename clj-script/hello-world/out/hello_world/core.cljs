(ns hello-world.core)
(println :started)

;; get editor
(defn getText
  "Get inner text of DOM element with ID [id]"
  [id]
  (let [elem (.getElementById js/document (str id))] elem.innerText))

;; get stuff inside of editor

;; do something like println that stuff

; (fn [editor] (.innerText js/))
; (println editorText)
