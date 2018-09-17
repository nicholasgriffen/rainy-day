(ns hello-world.core)
(println :started)

;; get editor
;; get stuff inside of editor

(defn getText
  "Get inner text of DOM element with ID [id]"
  [id]
  (let [elem (.getElementById js/document (str id))] elem.innerText))

;; do something like println that stuff
(println (getText "editor"))

;; add event listener to editor and log inner text on click
(.addEventListener (.getElementById js/document "editor") "click" (fn [e] (println (getText e.target.id))))
