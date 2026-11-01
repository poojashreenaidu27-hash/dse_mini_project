// src/pages/Home.tsx
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

function Home() {
  return (
    <div className="min-h-screen bg-primary text-textPrimary flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 bg-gradient-to-br from-primary to-secondary flex flex-col items-center space-y-6">
        <p className="text-sm uppercase tracking-widest text-lavender">SMART CAMPUS INFRASTRUCTURE</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-center px-4">
          Build a <span className="bg-clip-text text-transparent bg-gradient-to-r from-lavender to-primary">Better Campus</span>,<br />
          One Report at a Time.
        </h1>
        <p className="max-w-2xl text-center text-primary-secondary text-lg">
          Report maintenance issues anonymously, track repairs transparently, and help identify recurring campus infrastructure problems through data‑driven insights.
        </p>
        <div className="flex gap-4 mt-4">
          <Button as={Link} to="/complaint" className="bg-primary hover:bg-primary-hover">Report an Issue</Button>
          <Button as={Link} to="/track" className="bg-secondary hover:bg-secondary">Track Complaint</Button>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="w-full max-w-5xl py-12 grid gap-6 md:grid-cols-3 px-4">
        <div className="bg-card rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-shadow flex flex-col items-center text-center">
          <svg className="w-12 h-12 mb-4 text-textPrimary" /* shield icon placeholder */>
            <rect width="100%" height="100%" fill="currentColor" />
          </svg>
          <h3 className="text-xl font-semibold mb-2 text-lavender">Anonymous Reporting</h3>
          <p className="text-textMuted mb-4">Submit issues without revealing your identity.</p>
          <Button as={Link} to="/complaint" className="bg-primary hover:bg-primary-hover">Report Anonymously</Button>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-shadow flex flex-col items-center text-center">
          <svg className="w-12 h-12 mb-4 text-textPrimary" /* clipboard icon placeholder */>
            <rect width="100%" height="100%" fill="currentColor" />
          </svg>
          <h3 className="text-xl font-semibold mb-2 text-lavender">Transparent Tracking</h3>
          <p className="text-textMuted mb-4">Track your complaint with a secret token.</p>
          <Button as={Link} to="/track" className="bg-primary hover:bg-primary-hover">Track a Report</Button>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-shadow flex flex-col items-center text-center">
          <svg className="w-12 h-12 mb-4 text-textPrimary" /* chart icon placeholder */>
            <rect width="100%" height="100%" fill="currentColor" />
          </svg>
          <h3 className="text-xl font-semibold mb-2 text-lavender">Predictive Maintenance</h3>
          <p className="text-textMuted mb-4">Analytics reveal recurring issues.</p>
          <Button as={Link} to="/analytics" className="bg-primary hover:bg-primary-hover">Explore Insights</Button>
        </div>
      </section>
    </div>
  )
}

export default Home
