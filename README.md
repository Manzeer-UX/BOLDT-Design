# BOLDT · Construction executive insights

A responsive React + Vite recreation inspired by the supplied Pinterest design: https://in.pinterest.com/pin/40250990415909712/

## Run

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

Features: animated CSS black-to-charcoal login, responsive layout, login/sign-up/reset views, password visibility, native validation, reduced-motion support, and a construction executive dashboard after login.

The dashboard uses the supplied Zone 1 report values. It includes production progress, operational health, alert distribution with selectable categories, equipment time distribution, workforce presence, classified production time, three executive insights, prioritized evidence dialogs, and a downloadable executive text report. Navigation scrolls to each section. Selectors list the single available project, zone and undated reporting snapshot; no alternate datasets are fabricated.

Metrics are derived from the supplied values: completion = 138.3 / 400, alert shares use 86 total alerts, production time shares use 261m 5s, and equipment shares use a separate 266m 47s observation total. The reported pump utilization is 90%. There is no schedule baseline, historical comparison, event-level evidence, live AI service, or supported finish-date forecast. Interpretations do not establish causation or workforce productivity.

Use any valid email and a password of 8+ characters to enter the demo. Authentication and social providers are not connected. No credentials are saved or transmitted. The background is recreated with CSS rather than using the original video. Google Fonts are loaded remotely with local font fallbacks.

