# Frontend System Design

## 🎯 Framework

Use this framework for all system design interviews:

### 1. Clarify Requirements (5 mins)

**Functional:**
- What features are essential vs nice-to-have?
- Who are the users?
- What are the key user flows?

**Non-Functional:**
- Scale (users, data volume)?
- Performance targets?
- Availability requirements?
- Device support (mobile, desktop)?

### 2. High-Level Design (10 mins)

Draw the architecture:
- Client (browser/mobile)
- API layer
- Backend services
- Database
- CDN/caching

**Discuss data flow** for key operations.

### 3. Deep Dive (20 mins)

Pick 2-3 areas to drill deep:
- Component architecture
- State management
- Performance optimization
- Caching strategy
- Real-time updates

**Discuss tradeoffs** for each decision.

### 4. Scale & Optimize (10 mins)

How would you handle:
- 10x users?
- Slow networks?
- Global distribution?
- Offline support?

## 📝 Common Questions

Each includes:
- Requirements to clarify
- High-level architecture
- Deep dive topics
- Scaling considerations

### Questions:
1. [Facebook Newsfeed](questions/facebook-newsfeed.md)
2. [Google Docs](questions/google-docs.md)
3. [Netflix](questions/netflix.md)
4. [Instagram](questions/instagram.md)
5. [Autocomplete](questions/autocomplete.md)
6. [Slack](questions/slack.md)

## 📊 Evaluation Rubric

Interviewers assess:

**Technical Depth (40%):**
- Understanding of web technologies
- Knowledge of patterns and tradeoffs
- Ability to go deep on topics

**Problem Solving (30%):**
- Structured approach
- Handling ambiguity
- Making reasonable assumptions

**Communication (20%):**
- Clear explanations
- Thinking out loud
- Asking good questions

**Pragmatism (10%):**
- Practical solutions
- Acknowledging constraints
- Starting simple, scaling later

## 💡 Pro Tips

1. **Draw diagrams** - Pictures > words
2. **State assumptions** - Make them explicit
3. **Start simple** - Add complexity iteratively
4. **Discuss tradeoffs** - There's no perfect solution
5. **Ask for feedback** - "Does this approach make sense?"

## 🚨 Common Mistakes

❌ Jumping to solution without requirements
❌ Being too vague (no specifics)
❌ Ignoring the frontend (focusing only on backend)
❌ Not discussing tradeoffs
❌ Overengineering for scale you don't need

## 📖 Study Resources

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Frontend System Design Guide](https://www.greatfrontend.com/system-design)
- Real company engineering blogs (Netflix, Airbnb, etc.)

---

**Practice:** Start with [Autocomplete](questions/autocomplete.md) (easier) →
