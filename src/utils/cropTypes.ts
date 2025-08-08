import { useTranslation } from '../hooks/useTranslation';

export const useCropTypes = () => {
  const { t } = useTranslation();

  return [
    { 
      value: 'millet', 
      label: t('crops.millet'), 
      accessibilityLabel: t('crops.milletDesc'), 
      icon: '🌾' 
    },
    { 
      value: 'sorghum', 
      label: t('crops.sorghum'), 
      accessibilityLabel: t('crops.sorghumDesc'), 
      icon: '🌾' 
    },
    { 
      value: 'maize', 
      label: t('crops.maize'), 
      accessibilityLabel: t('crops.maizeDesc'), 
      icon: '🌽' 
    },
    { 
      value: 'cotton', 
      label: t('crops.cotton'), 
      accessibilityLabel: t('crops.cottonDesc'), 
      icon: '🌿' 
    },
    { 
      value: 'groundnut', 
      label: t('crops.groundnut'), 
      accessibilityLabel: t('crops.groundnutDesc'), 
      icon: '🥜' 
    },
    { 
      value: 'cowpea', 
      label: t('crops.cowpea'), 
      accessibilityLabel: t('crops.cowpeaDesc'), 
      icon: '🫘' 
    },
    { 
      value: 'sesame', 
      label: t('crops.sesame'), 
      accessibilityLabel: t('crops.sesameDesc'), 
      icon: '🌱' 
    },
    { 
      value: 'rice', 
      label: t('crops.rice'), 
      accessibilityLabel: t('crops.riceDesc'), 
      icon: '🌾' 
    }
  ];
};
