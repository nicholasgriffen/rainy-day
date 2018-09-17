(ns hello-world.core)

(println :started)

(def api "https://api.github.com/users/nicholasgriffen")

(defn getDOMElement
   "Get DOM element by id [id]"
   [id]
   (.getElementById js/document (str id)))

(defn getText
   "Get inner text of DOM element"
   [id]
   (let [elem (getDOMElement id)], elem.innerText))

(defn listenFor
   "Listen for event on DOM element and do callback"
   [event id callback]
   (.addEventListener (getDOMElement id) event callback))

;; ugly but demonstrative example of using browser fetch api in clojurescript
;; js ;; fetch('url').then(res => res.json()).then(res => console.log(res))
;; cljs ;; (.then (.then (.fetch js/window "https://api.github.com/users/nicholasgriffen"))
;   (fn [res] (.json res)) (fn [res] (println res)))
(.catch (.then (.then (.fetch js/window api) #(.json %)) #(println %)) #(println %))
; (.. (.fetch js/window "https://api.github.com/us/nicholasgriffen")
;     (then #(.json %))
;     (then println))
;; add event listener to editor and log inner text on click
(listenFor "click" "editor" (fn [event] (println (getText event.target.id))))
(listenFor "submit" "github-form" (fn [event] (do (.preventDefault event) (.log js/console event.target))))
