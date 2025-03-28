import React from 'react';
import { Unit } from '../models/Unit';
import { PowerManager, PowerDefinition } from '../systems/PowerManager';

interface PowerBarProps {
  selectedUnit: Unit | null;
  onPowerSelected: (power: PowerDefinition) => void;
  onClose: () => void;
}

const getPowerImage = (powerName: string): string => {
  const imageName = powerName.toLowerCase();
  return `/images/powers/60px-${powerName}.png`;
};

export const PowerBar: React.FC<PowerBarProps> = ({ selectedUnit, onPowerSelected, onClose }) => {
  if (!selectedUnit) return null;

  const powers = selectedUnit.getAvailablePowers()
    .map(powerName => PowerManager.getPower(powerName))
    .filter((power): power is PowerDefinition => power !== undefined);

  return (
    <div className="power-bar">
      <div className="power-bar-content">
        {powers.map(power => (
          <button
            key={power.name}
            className="power-button"
            onClick={() => onPowerSelected(power)}
            disabled={
              selectedUnit.getCurrentFatigue() + power.fatigueIncrease > selectedUnit.getUnitType().maxFatigue ||
              selectedUnit.getCurrentVeil() < power.veilCost
            }
          >
            <div className="power-icon">
              <img src={getPowerImage(power.name)} alt={power.name} />
            </div>
            <div className="power-info">
              <div className="power-name">{power.name}</div>
              <div className="power-fatigue">FT: +{power.fatigueIncrease}</div>
              {power.veilCost > 0 && (
                <div className="power-veil">Veil: {power.veilCost}</div>
              )}
              <div className="power-range">
                Range: {power.minRange === power.maxRange ? power.minRange : `${power.minRange}-${power.maxRange}`}
              </div>
            </div>
          </button>
        ))}
      </div>
      <button className="close-button" onClick={onClose}>×</button>
    </div>
  );
};

// Add styles to the existing styles.css file
const styles = `
.power-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.power-bar-content {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 5px;
  max-width: 80%;
}

.power-button {
  background: #2c3e50;
  border: 2px solid #34495e;
  border-radius: 5px;
  color: white;
  padding: 10px;
  min-width: 120px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.power-button:hover:not(:disabled) {
  background: #34495e;
  transform: translateY(-2px);
}

.power-button:disabled {
  background: #7f8c8d;
  cursor: not-allowed;
  opacity: 0.7;
}

.power-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.power-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.power-info {
  flex: 1;
  text-align: left;
}

.power-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.power-fatigue {
  font-size: 0.8em;
  color: #e74c3c;
}

.power-veil {
  font-size: 0.8em;
  color: #9b59b6;
}

.power-range {
  font-size: 0.8em;
  color: #3498db;
}

.close-button {
  background: #c0392b;
  border: none;
  border-radius: 50%;
  color: white;
  width: 30px;
  height: 30px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: #e74c3c;
  transform: rotate(90deg);
}
`;

// Append styles to the existing styles.css file
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
