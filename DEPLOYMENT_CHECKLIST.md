# 🚀 Wavvy Deployment Checklist

Use this checklist to deploy Wavvy to production.

## Pre-Deployment

### Environment Setup
- [ ] Clone repository: `git clone https://github.com/dhruvvdave/wavvy.git`
- [ ] Copy environment file: `cp .env.example .env`
- [ ] Configure database URL in `.env`
- [ ] Set JWT_SECRET in `.env` (required - use strong random string)
- [ ] (Optional) Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET if using Spotify

### Dependencies Installation
- [ ] Install client dependencies: `cd client && npm install`
- [ ] Install server dependencies: `cd ../server && npm install`
- [ ] Verify no vulnerability warnings (or resolve them)

### Database Setup
- [ ] PostgreSQL installed and running
- [ ] Create database: `createdb wavvy`
- [ ] Generate Prisma client: `cd server && npm run prisma:generate`
- [ ] Run migrations: `npm run prisma:migrate`
- [ ] Verify database connection

### Audio Samples
- [ ] Replace placeholder files in `client/public/sounds/` with real samples
- [ ] Verify all 8 samples exist: kick, snare, hihat, 808, clap, openhat, perc, fx
- [ ] Ensure samples are in WAV format, 44.1kHz or 48kHz
- [ ] Test samples load correctly in sequencer

### Build & Test
- [ ] Build client: `cd client && npm run build`
- [ ] Build server: `cd server && npm run build`
- [ ] Run client locally: `npm run dev`
- [ ] Run server locally: `npm run dev`
- [ ] Test all features work locally

## Security Review

### Server Security
- [ ] JWT_SECRET is set to a strong random value (not default)
- [ ] Database credentials are secure
- [ ] CORS configured for production domain only
- [ ] File upload limits appropriate (currently 10MB)
- [ ] No sensitive data in git repository
- [ ] `.env` file is in `.gitignore`

### Client Security
- [ ] No API keys hardcoded in client code
- [ ] External links use rel="noopener noreferrer"
- [ ] Input validation on all forms
- [ ] XSS prevention in place

## Production Deployment

### Option 1: Docker Deployment
- [ ] Review `docker-compose.yml`
- [ ] Update environment variables in docker-compose
- [ ] Build images: `docker-compose build`
- [ ] Start services: `docker-compose up -d`
- [ ] Verify all containers running: `docker-compose ps`
- [ ] Check logs: `docker-compose logs -f`

### Option 2: Manual Deployment
- [ ] Set up Node.js 18+ on server
- [ ] Set up PostgreSQL 14+ on server
- [ ] Clone repository to server
- [ ] Install dependencies
- [ ] Build client and server
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure firewall rules
- [ ] Set up process manager (PM2/systemd)
- [ ] Start server: `npm start`
- [ ] Serve client build from web server

### Domain & SSL
- [ ] Configure DNS to point to server
- [ ] Install SSL certificate
- [ ] Force HTTPS redirect
- [ ] Update CORS configuration for production domain
- [ ] Test HTTPS connection

## Post-Deployment

### Verification
- [ ] Homepage loads correctly
- [ ] Sequencer plays beats
- [ ] Melody pads work
- [ ] Visualizer displays correctly
- [ ] File upload works
- [ ] User registration works
- [ ] User login works
- [ ] Beat creation/saving works
- [ ] Spotify search works (if configured)

### Performance
- [ ] Page load time < 3 seconds
- [ ] Visualizer runs at 60fps
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All browsers tested (Chrome, Firefox, Safari)

### Monitoring
- [ ] Set up error logging
- [ ] Configure uptime monitoring
- [ ] Set up database backups
- [ ] Configure analytics (optional)
- [ ] Set up alerts for downtime

## Maintenance

### Regular Tasks
- [ ] Monitor disk space (uploaded files)
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Backup database weekly
- [ ] Review security advisories
- [ ] Test backups monthly

### Updates
- [ ] Test updates in staging environment first
- [ ] Backup before updating
- [ ] Update dependencies
- [ ] Run security scans
- [ ] Test all features after update

## Troubleshooting

### Common Issues

**Server won't start**
- Check JWT_SECRET is set in .env
- Verify database connection
- Check port 5000 is available

**Database connection error**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists
- Check firewall rules

**File upload fails**
- Check uploads/ directory exists
- Verify directory permissions
- Check disk space
- Review file size limits

**Visualizer not working**
- Check browser console for errors
- Verify audio file is valid
- Test in different browser
- Check Web Audio API support

**External APIs fail**
- Verify API keys are correct
- Check API rate limits
- Review proxy configuration
- Check firewall allows outbound requests

## Support

For issues or questions:
- Check documentation in README.md
- Review API.md for API usage
- See CONTRIBUTING.md for development
- Open GitHub issue for bugs

---

**Deployment Status**: [ ] Not Started [ ] In Progress [ ] Complete

**Deployed By**: _______________

**Deployment Date**: _______________

**Production URL**: _______________

---

Good luck with your deployment! 🌊
