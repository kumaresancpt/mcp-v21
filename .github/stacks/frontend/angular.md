# Stack Profile: angular

## Language
TypeScript

## Framework
Angular 18+

## File extension
.ts for components, services, and modules; .html for templates; .scss for styles

## Package manager
npm

## Install command
npm install

## Dev command
ng serve

## Test command
ng test --watch=false

## Build command
ng build

## Dev server port
4200

## Dev server URL
http://localhost:4200

## API proxy config
angular.json — add proxyConfig and create proxy.conf.json:
proxy.conf.json:
```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```
angular.json (serve → options):
```json
"proxyConfig": "proxy.conf.json"
```

## Project structure
frontend/
  angular.json
  tsconfig.json
  tsconfig.app.json
  package.json
  proxy.conf.json
  src/
    main.ts                    ← entry point
    app/
      app.config.ts           ← standalone app config
      app.component.ts        ← root component
      app.routes.ts           ← routing
      components/             ← one folder per AC component
        component-name/
          component-name.component.ts
          component-name.component.html
          component-name.component.scss
      services/               ← API services + shared business logic
        api.service.ts
      models/                 ← data models and interfaces
    styles.scss               ← global styles
    index.html                ← HTML host

## Key conventions
- Use standalone components (Angular 14+)
- Services are singleton by default (providedIn: 'root')
- HTTP calls via HttpClientModule (provided in app.config.ts)
- Reactive Forms with FormBuilder
- RxJS observables for async operations
- One component per feature (feature-based folder structure)
