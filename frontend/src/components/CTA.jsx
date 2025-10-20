import { motion } from 'framer-motion';
import { ArrowRight, Star, MessageCircle, Users, TrendingUp, Check, Clock, Shield } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

const testimonials = [
  {
    text: "ngl this saved my career. was bombing interviews until i found this",
    author: "sarah",
    role: "swe @ google",
    rating: 5,
  },
  {
    text: "bro i literally spent 2 months on leetcode getting nowhere. tried this for a week and everything just clicked???",
    author: "alex",
    role: "cs student @ mit",
    rating: 5,
  },
  {
    text: "stopped getting roasted in code reviews after using this lmao",
    author: "mike",
    role: "tech lead @ stripe",
    rating: 5,
  },
  {
    text: "my algo prof asked if i was cheating bc my code got so good so fast 💀",
    author: "priya",
    role: "senior dev @ meta",
    rating: 5,
  },
  {
    text: "idk how this works but my O(n²) nightmares are gone",
    author: "jay",
    role: "backend dev @ airbnb",
    rating: 5,
  },
  {
    text: "finally understand big O notation. took 3 courses before this and learned nothing",
    author: "emma",
    role: "frontend @ shopify",
    rating: 5,
  },
];

const benefits = [
  { icon: Clock, text: "save 10+ hours per week", color: "text-blue-400" },
  { icon: TrendingUp, text: "level up 3x faster", color: "text-green-400" },
  { icon: Shield, text: "100% money-back guarantee", color: "text-purple-400" },
  { icon: Users, text: "10k+ active developers", color: "text-pink-400" },
];

const CTA = () => {
  const [hoveredTestimonial, setHoveredTestimonial] = useState(null);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => scrollElement.removeEventListener('scroll', checkScroll);
    }
  }, []);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black"></div>

      <div className="max-w-7xl mx-auto relative">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="inline-block mb-6"
          >
            <span className="text-6xl">🚀</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            ready to <span className="text-gradient glow">dominate</span> your code?
          </h2>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            join 10k+ developers optimizing code at Google, Meta, and Microsoft.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
              >
                <benefit.icon className={`w-6 h-6 ${benefit.color} mx-auto mb-2`} />
                <p className="text-sm text-gray-300">{benefit.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="group">
                subscribe now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="mailto:support@reflexalgo.com?subject=I want to chat about ReflexAlgo" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="group">
                <MessageCircle className="mr-2 w-5 h-5" />
                talk to us
              </Button>
            </a>
          </div>
          
          <p className="text-sm text-gray-400">
            trusted by 10,000+ professional developers • cancel anytime
          </p>
        </motion.div>

        {/* Scrollable Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">
              real talk from <span className="text-gradient">real devs</span>
            </h3>
            <p className="text-gray-400">no cap, these are actual reviews</p>
          </div>

          {/* Scroll Navigation */}
          <div className="relative">
            {/* Left Arrow */}
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <ArrowRight className="w-5 h-5 rotate-180 text-white" />
              </motion.button>
            )}

            {/* Right Arrow */}
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </motion.button>
            )}

            {/* Horizontal Scroll Container */}
            <div 
              ref={scrollRef}
              className="overflow-x-auto pb-8 -mx-4 px-4 hide-scrollbar scroll-smooth"
            >
              <div className="flex gap-6 min-w-max px-12">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    onHoverStart={() => setHoveredTestimonial(index)}
                    onHoverEnd={() => setHoveredTestimonial(null)}
                    className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 w-80 hover:border-purple-500/50 transition-all"
                  >
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Quote - NO QUOTES, more natural */}
                    <p className="text-gray-200 mb-6 leading-relaxed text-base">
                      {testimonial.text}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {testimonial.author[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold capitalize">{testimonial.author}</p>
                        <p className="text-gray-400 text-xs">{testimonial.role}</p>
                      </div>
                    </div>

                    {/* Hover glow */}
                    {hoveredTestimonial === index && (
                      <motion.div
                        layoutId="testimonial-hover"
                        className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-2xl pointer-events-none"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Better scroll hint */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-purple-500 rounded-full"
            />
            <p className="text-gray-500 text-sm">drag or use arrows to see more</p>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="w-2 h-2 bg-purple-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* What You Get Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20 bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-3xl p-8 md:p-12"
      >
        <h3 className="text-3xl font-bold mb-8 text-center">
          enterprise-grade <span className="text-gradient">features</span>
        </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
        {[
          "unlimited code reviews & optimizations",
          "advanced AI engine with deep learning",
          "real-time feedback (< 2 seconds)",
          "pattern recognition for 50+ algorithms",
          "comprehensive analytics dashboard",
          "before/after performance comparisons",
          "multi-language support (10+ languages)",
          "priority support (< 1 hour response)",
          "early access to beta features",
          "exclusive community (10k+ professionals)",
          "weekly expert-led masterclasses",
          "monthly webinars with FAANG engineers",
        ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 group"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-gray-300 group-hover:text-white transition-colors">{item}</p>
              </motion.div>
            ))}
          </div>

      {/* Final CTA */}
      <div className="mt-12 text-center">
        <p className="text-2xl font-bold mb-6">
          ready to <span className="text-gradient">transform</span> your code?
        </p>
        <Link to="/signup">
          <Button variant="primary" size="lg" className="group">
            start your journey now
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <p className="text-xs text-gray-400 mt-4">
          trusted by 10,000+ professional developers • cancel anytime
        </p>
      </div>
        </motion.div>
      </div>

    </section>
  );
};

export default CTA;

