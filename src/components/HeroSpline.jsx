import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroSpline() {
  return (
    <div className="w-full h-[60vh] md:h-[70vh] relative">
      <Spline scene="https://prod.spline.design/IKzHtP5ThSO83edK/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/70 pointer-events-none" />
    </div>
  );
}
