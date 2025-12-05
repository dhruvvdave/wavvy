# Contributing to Wavvy

Thank you for your interest in contributing to Wavvy! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/wavvy.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Open a Pull Request

## 📋 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code structure and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Format code with Prettier (run `npm run lint`)

### Component Guidelines

- Keep components small and focused
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Make components responsive by default

### Audio Features

- Always use Tone.js for audio synthesis
- Use Web Audio API for visualization
- Ensure audio playback works across browsers
- Test with different audio file formats
- Handle audio context initialization properly

### State Management

- Use Zustand for global state
- Keep local state when appropriate
- Avoid prop drilling with context when needed
- Document state structure

### API Guidelines

- Use RESTful conventions
- Implement proper error handling
- Return consistent error responses
- Add appropriate HTTP status codes
- Document all endpoints

## 🧪 Testing

Before submitting a PR:

1. Run linting: `npm run lint`
2. Build the project: `npm run build`
3. Test in development mode
4. Test the production build
5. Check for console errors/warnings
6. Test on different browsers (Chrome, Firefox, Safari)

## 📝 Commit Messages

Use clear and descriptive commit messages:

- `feat: Add SoundCloud search functionality`
- `fix: Fix visualizer performance issue`
- `docs: Update README with new features`
- `style: Format code with Prettier`
- `refactor: Simplify audio player logic`
- `test: Add tests for sequencer`

## 🎨 UI/UX Guidelines

- Maintain the dark neon theme
- Use the defined color palette
- Add smooth animations with Framer Motion
- Ensure accessibility (keyboard navigation, ARIA labels)
- Make UI responsive for mobile, tablet, and desktop
- Test with different screen sizes

## 🐛 Reporting Bugs

When reporting bugs, include:

1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Browser and OS information
6. Screenshots/videos if applicable
7. Console errors if any

## 💡 Feature Requests

When requesting features:

1. Describe the feature clearly
2. Explain the use case
3. Provide examples if possible
4. Discuss implementation approach

## 🎵 Audio Samples

When adding audio samples:

- Use royalty-free samples only
- Include attribution if required
- Keep file sizes reasonable
- Use standard formats (WAV, MP3)
- Name files descriptively

## 🔒 Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize data before database operations
- Follow security best practices

## 📚 Documentation

- Update README.md for new features
- Add JSDoc comments for functions
- Document props for components
- Update API documentation
- Include usage examples

## ⚡ Performance

- Optimize bundle size
- Use lazy loading where appropriate
- Minimize re-renders
- Optimize audio processing
- Use Canvas efficiently for visualizations

## 🤝 Code Review

All PRs will be reviewed for:

- Code quality
- Test coverage
- Documentation
- Performance
- Security
- UI/UX consistency

## 📞 Questions?

If you have questions:

- Open a GitHub Discussion
- Check existing issues
- Read the documentation
- Ask in your PR

Thank you for contributing to Wavvy! 🌊
