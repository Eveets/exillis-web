import React, { useEffect, useRef, useState } from 'react';
import { Game } from './models/Game';
import { GameRenderer } from './systems/GameRenderer';
import { CubeCoord, HexGrid } from './models/HexGrid';
import { UnitFactory } from './models/UnitFactory';
import { PowerBar } from './components/PowerBar';
import { PowerDefinition, PowerManager } from './systems/PowerManager';
import { Unit } from './models/Unit';
import { PathFinder } from './systems/PathFinder';
import { Zone } from './models/Board';
import { IntroScreen } from './components/IntroScreen/IntroScreen';
import { MenuScreen } from './components/MenuScreen/MenuScreen';
import './styles.css';

type Screen = 'intro' | 'menu' | 'game';

const BOARD_RADIUS = 5;
const HEX_SIZE = 60;

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro');
  const hexGrid = new HexGrid(HEX_SIZE);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [renderer, setRenderer] = useState<GameRenderer | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedPower, setSelectedPower] = useState<PowerDefinition | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string>('player_0');
  const [showCoordinates, setShowCoordinates] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [pathFinder, setPathFinder] = useState<PathFinder | null>(null);

  const initializeGame = () => {
    const newGame = Game.createNewGame(BOARD_RADIUS, HEX_SIZE, ['Player 1', 'Player 2']);
    setGame(newGame);

    // Create different unit types for players
    const player1Unit = UnitFactory.createBillmen(1);
    const player2Unit = UnitFactory.createLucifer(1);

    // Add units to the game
    newGame.createUnit('player_0', player1Unit, { q: -BOARD_RADIUS, r: BOARD_RADIUS, s: 0 }); // Billmen starts at bottom left
    newGame.createUnit('player_1', player2Unit, { q: BOARD_RADIUS, r: -BOARD_RADIUS, s: 0 }); // Lucifer starts at top right

    if (canvasRef.current) {
      const newRenderer = new GameRenderer(canvasRef.current, newGame);
      setRenderer(newRenderer);
      newRenderer.render();
    }

    const newPathFinder = new PathFinder(newGame.getBoard());
    setPathFinder(newPathFinder);
  };

  useEffect(() => {
    if (currentScreen === 'game') {
      initializeGame();
    }
  }, [currentScreen]);

  useEffect(() => {
    if (renderer) {
      renderer.setSelectedUnit(selectedUnit);
      renderer.setSelectedPower(selectedPower);
      renderer.setShowCoordinates(showCoordinates);
      renderer.render();
    }
  }, [selectedUnit, selectedPower, renderer, showCoordinates]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!game || !renderer || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    // Convert screen coordinates to hex coordinates using the renderer
    const hexCoords = renderer.screenToHex(screenX, screenY);

    const clickedUnit = game.getUnitAtPosition(hexCoords);
    const clickedZone = game.getBoard().getZone(hexCoords);

    if (selectedUnit && selectedPower) {
      // Execute the selected power
      const target = clickedUnit || clickedZone;
      if (target && PowerManager.isValidTarget(target, selectedUnit, selectedPower.name)) {
        executePower(selectedUnit, selectedPower, target, hexCoords);
      } else {
        // If the target is invalid, deselect the power but keep the unit selected
        setSelectedPower(null);
      }
    } else if (clickedUnit && game.getUnitOwner(clickedUnit) === currentPlayer) {
      // Select the clicked unit if it belongs to the current player
      setSelectedUnit(clickedUnit);
      setSelectedPower(null); // Clear any previously selected power
    } else {
      // Deselect if clicking on empty space or opponent's unit
      setSelectedUnit(null);
      setSelectedPower(null);
    }
  };

  const executePower = (unit: Unit, power: PowerDefinition, target: Unit | Zone, hexCoords: CubeCoord) => {
    if (power.name === 'Move' && pathFinder) {
      const path = pathFinder.findPath(unit.getPosition(), hexCoords, unit);
      if (path && path.length - 1 <= unit.getUnitType().movement) {
        power.execute(unit, target);
        game!.nextTurn();
        handleTurnEnd(game!, renderer!);
      }
    } else {
      power.execute(unit, target);
      game!.nextTurn();
      handleTurnEnd(game!, renderer!);
    }
  };

  const handleTurnEnd = (game: Game, renderer: GameRenderer) => {
    // Check for game over
    if (game.isGameOver()) {
      const winner = game.getWinner();
      setGameOver(true);
      setWinner(winner ? winner.name : null);
    } else {
      setCurrentPlayer(currentPlayer === 'player_0' ? 'player_1' : 'player_0');
    }

    setSelectedUnit(null);
    setSelectedPower(null);
    renderer.render();
  };

  const handlePowerSelected = (power: PowerDefinition) => {
    setSelectedPower(power);
  };

  const handlePowerBarClose = () => {
    setSelectedUnit(null);
    setSelectedPower(null);
  };

  const renderGameScreen = () => (
    <div className="game-container">
      <h1>Exillis Web</h1>
      <div className="game-board">
        <canvas ref={canvasRef} onClick={handleCanvasClick} />
      </div>
      {gameOver ? (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>{winner ? `${winner} wins!` : "It's a draw!"}</p>
          <button onClick={() => setCurrentScreen('menu')}>Back to Menu</button>
        </div>
      ) : (
        <>
          <div className="controls">
            <div className="control-row">
              <p>
                {`Current Player: ${currentPlayer === 'player_0' ? 'Player 1' : 'Player 2'}`}
              </p>
              <label className="debug-toggle">
                <input
                  type="checkbox"
                  checked={showCoordinates}
                  onChange={(e) => setShowCoordinates(e.target.checked)}
                />
                Show Coordinates
              </label>
            </div>
            <p>
              {selectedUnit
                ? selectedPower
                  ? `Select a target for ${selectedPower.name}`
                  : "Select a power to use"
                : "Click on a unit to select it"
              }
            </p>
          </div>
          <PowerBar
            selectedUnit={selectedUnit}
            onPowerSelected={handlePowerSelected}
            onClose={handlePowerBarClose}
          />
        </>
      )}
    </div>
  );

  switch (currentScreen) {
    case 'intro':
      return <IntroScreen onIntroComplete={() => setCurrentScreen('menu')} />;
    case 'menu':
      return <MenuScreen onStartGame={() => setCurrentScreen('game')} />;
    case 'game':
      return renderGameScreen();
    default:
      return null;
  }
};

export default App;
