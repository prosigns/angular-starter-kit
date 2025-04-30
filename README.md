# Angular 17 Starter Kit

This is a production-ready, enterprise-grade Angular 17.3.x base project tailored for large, high-traffic web applications. Developed by Prosigns, this starter kit is modular, scalable, maintainable, and optimized for performance and developer experience. Developed by [Prosigns](https://www.prosignstech.com/).

## About Prosigns

Prosigns Technologies is a leading provider of custom software development services in the USA, Canada, and Middle East. With a team of 135+ tech innovators, Prosigns specializes in:

- Business Enablement: Strategic solutions that drive operational efficiency and market expansion
- Artificial Intelligence: Turning data into actionable insights and competitive advantage
- Digital Transformation: Empowering businesses to thrive in the digital era
- Engineering: Precision-driven solutions for seamless performance and scalability

Prosigns offers services across diverse industries including SaaS, Healthcare, Finance, Oil and Gas, Logistics, Real Estate, and more. The company is dedicated to delivering high-quality, tailored tech solutions that strengthen core business functions and unlock new digital possibilities.

For more information, visit [prosignstech.com](https://www.prosignstech.com/) or contact them at:

- Email: services@prosignstech.com
- US: +1 469 663 3444

## 🧱 Project Structure & Architecture

- **Modular architecture** using Standalone Components and feature modules
- **CoreModule and SharedModule** separation for better code organization
- **Lazy loading** with dynamic imports for all major modules
- **Clear folder structure** using Domain-Driven Design pattern

## 🚀 Key Features

- **Progressive Web App (PWA)** support with offline capabilities and installable experience
- **Server-side rendering** with Angular Universal
- **Intelligent preloading strategies** for optimal loading experience
- **RxJS best practices** with takeUntil pattern, shareReplay, etc.
- **OnPush change detection** and standalone signals for reactive performance
- **Image and asset lazy loading** for faster initial page load
- **JWT-based authentication** system with auto-refresh and token interceptor
- **Route guards** for auth, roles, and permissions protection
- **XSS and CSRF protection** measures for enhanced security
- **Multi-language support** using Angular's i18n or ngx-translate
- **Dynamic language switching** with locale storage
- **NgRx state management** with Actions, Effects, Reducers, Selectors
- **Global error handler** with user-friendly error pages
- **Logging service** with support for external logging tools
- **Performance monitoring** with Web Vitals
- **Automated testing** setup with Jasmine, Karma, and Cypress
- **Responsive components** with ARIA best practices

## 🛠️ Technology Stack

- Angular 17.3.x
- TypeScript 5.4.x
- RxJS 7.8.x
- NgRx 17.x
- Standalone Components
- Signals API
- SSR with Angular Universal
- PWA capabilities
- TailwindCSS / Custom UI Components
- ESLint + Prettier
- Husky + lint-staged
- Storybook
- Jasmine + Karma
- Cypress / Playwright

## 📂 Folder Structure

```
src/
├── app/
│   ├── core/                     # Core functionality used throughout the app
│   │   ├── guards/               # Route guards
│   │   ├── handlers/             # Global handlers (error, etc.)
│   │   ├── interceptors/         # HTTP interceptors
│   │   ├── models/               # Core data models/interfaces
│   │   ├── services/             # Singleton services
│   │   ├── strategies/           # Custom strategies
│   │   └── utils/                # Utility functions
│   │
│   ├── features/                 # Feature modules
│   │   ├── admin/                # Admin feature
│   │   ├── auth/                 # Authentication feature
│   │   ├── dashboard/            # Dashboard feature
│   │   └── home/                 # Home feature
│   │
│   ├── shared/                   # Shared functionality
│   │   ├── components/           # Reusable components
│   │   ├── directives/           # Custom directives
│   │   ├── pipes/                # Custom pipes
│   │   └── utils/                # Shared utilities
│   │
│   ├── app.component.ts          # Root component
│   ├── app.config.ts             # Application config
│   └── app.routes.ts             # Root routing
│
├── assets/                       # Static assets
│   └── i18n/                     # Translation files
│
├── environments/                 # Environment configurations
└── styles.scss                   # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/angular-starter-kit.git
cd angular-starter-kit

# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run build:staging` - Build for staging environment
- `npm run build:ssr` - Build for server-side rendering
- `npm run dev:ssr` - Start SSR development server
- `npm run serve:ssr` - Serve SSR build
- `npm run prerender` - Prerender static pages
- `npm test` - Run tests
- `npm run test:ci` - Run tests in CI mode
- `npm run lint` - Run linting
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run storybook` - Start Storybook development server
- `npm run analyze` - Analyze bundle size

## 🔧 Configuration

### Environment Variables

The application supports multiple environments: `development`, `staging`, and `production`. Environment files are located in the `src/environments/` directory.

### PWA Configuration

The Progressive Web App configuration is managed through the `ngsw-config.json` file in the root directory. It defines caching strategies, installable behavior, and offline capabilities.

### i18n Configuration

Translation files are located in `src/assets/i18n/` directory, with one JSON file per language.

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --code-coverage
```

### End-to-End Tests

```bash
# Run e2e tests
npm run e2e
```

## 🚀 Deployment

### Building for Production

```bash
# Build for production
npm run build:prod

# Build for SSR
npm run build:ssr
```

### Docker Support

A Dockerfile and docker-compose.yml are included for containerized deployments.

```bash
# Build and run with Docker
docker-compose up --build
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit your changes: `git commit -am 'feat: add new feature'`
3. Push to the branch: `git push origin feature/my-feature`
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Angular](https://angular.io/)
- [NgRx](https://ngrx.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [ngx-translate](http://www.ngx-translate.com/)
- [Prosigns](https://prosigns.dev) - Creator of this starter kit
