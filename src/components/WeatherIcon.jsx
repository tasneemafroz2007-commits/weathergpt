import React from 'react';
import {
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSun,
  Sun,
  Moon,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  ShieldCheck,
  Compass,
  Plane,
  HeartPulse,
  Wheat,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Sliders,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export function WeatherIcon({ name, size = 20, className = '' }) {
  switch (name) {
    case 'sun':
      return <Sun size={size} className={className} />;
    case 'moon':
      return <Moon size={size} className={className} />;
    case 'cloud':
      return <Cloud size={size} className={className} />;
    case 'cloud-sun':
      return <CloudSun size={size} className={className} />;
    case 'cloud-rain':
    case 'rain-moderate':
      return <CloudRain size={size} className={className} />;
    case 'cloud-heavy-rain':
      return <CloudRain size={size} className={className} />;
    case 'cloud-drizzle':
      return <CloudDrizzle size={size} className={className} />;
    case 'cloud-lightning':
      return <CloudLightning size={size} className={className} />;
    case 'cloud-wind':
    case 'wind':
      return <Wind size={size} className={className} />;
    case 'Wheat':
    case 'farmer':
      return <Wheat size={size} className={className} />;
    case 'Plane':
    case 'traveller':
      return <Plane size={size} className={className} />;
    case 'Compass':
    case 'outdoor':
      return <Compass size={size} className={className} />;
    case 'HeartPulse':
    case 'health':
      return <HeartPulse size={size} className={className} />;
    default:
      return <CloudSun size={size} className={className} />;
  }
}

export {
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSun,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  ShieldCheck,
  Compass,
  Plane,
  HeartPulse,
  Wheat,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Sliders,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles
};
