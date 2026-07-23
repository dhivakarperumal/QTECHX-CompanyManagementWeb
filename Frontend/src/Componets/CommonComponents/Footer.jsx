import React from 'react'
import PageContainer from './PageContainer'

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white py-8">
      <PageContainer>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">QTech Solutions</h2>
            <p className="text-sm text-slate-300">Building modern web experiences with React and Node.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <span>Contact</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </PageContainer>
    </footer>
  )
}

export default Footer