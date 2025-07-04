"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface MetricsPanelProps {
  fixtureCount: number
  totalPower: number
  averagePPFD: number
  uniformity: number
  coverage: number
  roomArea: number
  targetPPFD: number
  powerCost: {
    daily: number
    monthly: number
    yearly: number
  }
  onShowEnergyCostCalculator?: () => void
  onShowMaintenanceScheduler?: () => void
  onShowEnergyMonitoring?: () => void
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
}

const metricVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  },
  tap: {
    scale: 0.95
  }
}

const iconVariants = {
  initial: { rotate: 0 },
  animate: { 
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
}

// Animated number component
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const startValue = displayValue
    const endValue = value
    const duration = 1000 // 1 second
    const startTime = Date.now()
    
    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      const currentValue = startValue + (endValue - startValue) * easeOutQuart
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [value])
  
  return <>{displayValue.toFixed(decimals)}</>
}

// Trend indicator component
function TrendIndicator({ currentValue, previousValue }: { currentValue: number; previousValue?: number }) {
  if (!previousValue || currentValue === previousValue) {
    return <Minus className="w-3 h-3 text-gray-500" />
  }
  
  const percentChange = ((currentValue - previousValue) / previousValue) * 100
  const isPositive = currentValue > previousValue
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}
    >
      {isPositive ? (
        <motion.div
          animate={{ y: [-2, 0, -2] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ArrowUp className="w-3 h-3" />
        </motion.div>
      ) : (
        <motion.div
          animate={{ y: [2, 0, 2] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ArrowDown className="w-3 h-3" />
        </motion.div>
      )}
      <span>{Math.abs(percentChange).toFixed(1)}%</span>
    </motion.div>
  )
}

export function MetricsPanel({
  fixtureCount,
  totalPower,
  averagePPFD,
  uniformity,
  coverage,
  roomArea,
  targetPPFD,
  powerCost,
  onShowEnergyCostCalculator,
  onShowMaintenanceScheduler,
  onShowEnergyMonitoring
}: MetricsPanelProps) {
  const powerDensity = totalPower / roomArea
  const ppfdStatus = averagePPFD >= targetPPFD ? 'optimal' : averagePPFD >= targetPPFD * 0.8 ? 'warning' : 'critical'
  const uniformityStatus = uniformity >= 0.8 ? 'optimal' : uniformity >= 0.6 ? 'warning' : 'critical'
  
  // Store previous values for trend indicators
  const [previousValues, setPreviousValues] = useState({
    ppfd: averagePPFD,
    uniformity: uniformity,
    power: totalPower
  })
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousValues({
        ppfd: averagePPFD,
        uniformity: uniformity,
        power: totalPower
      })
    }, 5000) // Update every 5 seconds
    
    return () => clearTimeout(timer)
  }, [averagePPFD, uniformity, totalPower])

  const getStatusIcon = (status: string) => {
    const icons = {
      optimal: <CheckCircle className="w-4 h-4 text-green-400" />,
      warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
      critical: <XCircle className="w-4 h-4 text-red-400" />
    }
    
    return (
      <motion.div
        variants={iconVariants}
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.2 }}
      >
        {icons[status as keyof typeof icons]}
      </motion.div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'critical':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <motion.div 
      className="bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-700 p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 
        className="text-white font-semibold text-lg"
        variants={itemVariants}
      >
        Performance Analysis
      </motion.h3>

      {/* Primary Metrics */}
      <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
        <motion.div 
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 cursor-pointer"
          variants={metricVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs">Avg PPFD</p>
            <div className="flex items-center gap-2">
              <TrendIndicator currentValue={averagePPFD} previousValue={previousValues.ppfd} />
              {getStatusIcon(ppfdStatus)}
            </div>
          </div>
          <motion.p 
            className={`text-2xl font-bold ${getStatusColor(ppfdStatus)}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedNumber value={averagePPFD} />
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">
            Target: {targetPPFD} μmol/m²/s
          </p>
          <motion.div 
            className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div 
              className={`h-full ${ppfdStatus === 'optimal' ? 'bg-green-500' : ppfdStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((averagePPFD / targetPPFD) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>

        <motion.div 
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 cursor-pointer"
          variants={metricVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs">Uniformity</p>
            <div className="flex items-center gap-2">
              <TrendIndicator currentValue={uniformity} previousValue={previousValues.uniformity} />
              {getStatusIcon(uniformityStatus)}
            </div>
          </div>
          <motion.p 
            className={`text-2xl font-bold ${getStatusColor(uniformityStatus)}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedNumber value={uniformity * 100} />%
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">
            Min/Avg Ratio
          </p>
          <motion.div 
            className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div 
              className={`h-full ${uniformityStatus === 'optimal' ? 'bg-green-500' : uniformityStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${uniformity * 100}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Secondary Metrics */}
      <motion.div 
        className="grid grid-cols-3 gap-3"
        variants={itemVariants}
      >
        <motion.div 
          className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer"
          variants={metricVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div 
            className="inline-flex p-2 bg-purple-500/20 rounded-lg mb-2"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Activity className="w-4 h-4 text-purple-400" />
          </motion.div>
          <p className="text-xs text-gray-400">Coverage</p>
          <p className="text-lg font-semibold text-white">
            <AnimatedNumber value={coverage * 100} />%
          </p>
        </motion.div>

        <motion.div 
          className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer"
          variants={metricVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onShowEnergyMonitoring}
        >
          <motion.div 
            className="inline-flex p-2 bg-yellow-500/20 rounded-lg mb-2"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="w-4 h-4 text-yellow-400" />
          </motion.div>
          <p className="text-xs text-gray-400">Power/m²</p>
          <p className="text-lg font-semibold text-white">
            <AnimatedNumber value={powerDensity} />W
          </p>
        </motion.div>

        <motion.div 
          className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer"
          variants={metricVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div 
            className="inline-flex p-2 bg-blue-500/20 rounded-lg mb-2"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Target className="w-4 h-4 text-blue-400" />
          </motion.div>
          <p className="text-xs text-gray-400">Fixtures</p>
          <p className="text-lg font-semibold text-white">
            <AnimatedNumber value={fixtureCount} />
          </p>
        </motion.div>
      </motion.div>

      {/* Power Cost Analysis */}
      <motion.div 
        className="bg-gray-800/50 rounded-lg p-4 space-y-3"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <DollarSign className="w-4 h-4 text-green-400" />
            </motion.div>
            Energy Costs
          </h4>
          <motion.button
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            onClick={onShowEnergyCostCalculator}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Details →
          </motion.button>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {[
              { label: 'Daily', value: powerCost.daily, color: 'text-green-400' },
              { label: 'Monthly', value: powerCost.monthly, color: 'text-yellow-400' },
              { label: 'Yearly', value: powerCost.yearly, color: 'text-orange-400' }
            ].map((cost, index) => (
              <motion.div
                key={cost.label}
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-xs text-gray-400">{cost.label}</span>
                <motion.span 
                  className={`text-sm font-medium ${cost.color}`}
                  whileHover={{ scale: 1.1 }}
                >
                  ${<AnimatedNumber value={cost.value} decimals={2} />}
                </motion.span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="flex gap-2"
        variants={itemVariants}
      >
        <motion.button
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-colors"
          onClick={onShowMaintenanceScheduler}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Schedule Maintenance
        </motion.button>
        <motion.button
          className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg font-medium transition-colors"
          onClick={onShowEnergyMonitoring}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Energy Monitor
        </motion.button>
      </motion.div>
    </motion.div>
  )
}