import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Separator } from '@radix-ui/react-separator';
import { Card } from './components/ui/card';


type Choice = 'rock' | 'paper' | 'scissors';
type GameState = 'ready' | 'countdown' | 'playing' | 'result';
type Result = 'win' | 'lose' | 'tie';

interface Score {
  player: number;
  computer: number;
}

const choices: Choice[] = ['rock', 'paper', 'scissors'];

const getEmoji = (choice: Choice): string => {
  switch (choice) {
    case 'rock': return '🪨';
    case 'paper': return '📄';
    case 'scissors': return '✂️';
  }
};

const getChoiceName = (choice: Choice): string => {
  switch (choice) {
    case 'rock': return 'Rock';
    case 'paper': return 'Paper';
    case 'scissors': return 'Scissors';
  }
};

const determineWinner = (playerChoice: Choice, computerChoice: Choice): Result => {
  if (playerChoice === computerChoice) return 'tie';
  
  const winConditions: Record<Choice, Choice> = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };
  
  return winConditions[playerChoice] === computerChoice ? 'win' : 'lose';
};

const getResultMessage = (result: Result): string => {
  switch (result) {
    case 'win': return 'You win! 🎉';
    case 'lose': return 'You lost 😢';
    case 'tie': return "It's a tie 🤝";
  }
};

const RockPaperScissors: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState<Score>({ player: 0, computer: 0 });
  const [countdownText, setCountdownText] = useState<string>('');
  const [isScoreAnimating, setIsScoreAnimating] = useState<'player' | 'computer' | null>(null);

  const playSound = (type: 'click' | 'win' | 'lose') => {
    // Simple audio feedback using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'click':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        break;
      case 'win':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
        break;
      case 'lose':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        break;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handlePlayerChoice = (choice: Choice) => {
    if (gameState !== 'ready') return;
    
    playSound('click');
    setPlayerChoice(choice);
    setGameState('countdown');
    
    const countdownSequence = ['Rock...', 'Paper...', 'Scissors...', 'Shoot!'];
    let index = 0;
    
    const countdownInterval = setInterval(() => {
      setCountdownText(countdownSequence[index]);
      index++;
      
      if (index >= countdownSequence.length) {
        clearInterval(countdownInterval);
        
        // Generate computer choice after countdown
        setTimeout(() => {
          const computerChoice = choices[Math.floor(Math.random() * choices.length)];
          setComputerChoice(computerChoice);
          
          const gameResult = determineWinner(choice, computerChoice);
          setResult(gameResult);
          
          // Update score
          if (gameResult === 'win') {
            setScore(prev => ({ ...prev, player: prev.player + 1 }));
            setIsScoreAnimating('player');
            playSound('win');
          } else if (gameResult === 'lose') {
            setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
            setIsScoreAnimating('computer');
            playSound('lose');
          }
          
          setGameState('result');
          
          // Reset score animation
          setTimeout(() => setIsScoreAnimating(null), 600);
        }, 500);
      }
    }, 800);
  };

  const resetGame = () => {
    setGameState('ready');
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setCountdownText('');
  };

  const resetScore = () => {
    setScore({ player: 0, computer: 0 });
  };

  const getButtonClass = (choice: Choice): string => {
    const baseClass = "game-button h-24 w-24 md:h-32 md:w-32 rounded-2xl border-2 text-4xl md:text-5xl font-bold text-white";
    
    switch (choice) {
      case 'rock':
        return `${baseClass} game-button-rock`;
      case 'paper':
        return `${baseClass} game-button-paper`;
      case 'scissors':
        return `${baseClass} game-button-scissors`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-8 bg-card/90 backdrop-blur-sm border-primary/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            Rock Paper Scissors
          </h1>
          <p className="text-muted-foreground text-lg">Choose your weapon!</p>
        </div>

        {/* Score Board */}
        <div className="flex justify-center items-center gap-8 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-foreground">You</h3>
            <div className={`text-3xl font-bold text-primary ${isScoreAnimating === 'player' ? 'score-increase' : ''}`}>
              {score.player}
            </div>
          </div>
          <Separator orientation="vertical" className="h-16" />
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-foreground">Computer</h3>
            <div className={`text-3xl font-bold text-destructive ${isScoreAnimating === 'computer' ? 'score-increase' : ''}`}>
              {score.computer}
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="text-center mb-8">
          {gameState === 'ready' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Make your choice!</h2>
              <div className="flex justify-center gap-6 flex-wrap">
                {choices.map((choice) => (
                  <Button
                    key={choice}
                    className={getButtonClass(choice)}
                    onClick={() => handlePlayerChoice(choice)}
                  >
                    {getEmoji(choice)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'countdown' && (
            <div className="space-y-6">
              <div className="text-4xl md:text-6xl font-bold text-primary countdown">
                {countdownText}
              </div>
            </div>
          )}

          {gameState === 'result' && playerChoice && computerChoice && result && (
            <div className="space-y-6">
              {/* Choices Display */}
              <div className="flex justify-center items-center gap-8 md:gap-16">
                <div className="text-center">
                  <div className="text-6xl md:text-8xl mb-2 animate-bounce">
                    {getEmoji(playerChoice)}
                  </div>
                  <p className="text-lg font-semibold text-foreground">You chose {getChoiceName(playerChoice)}</p>
                </div>
                
                <div className="text-4xl font-bold text-muted-foreground">VS</div>
                
                <div className="text-center">
                  <div className="text-6xl md:text-8xl mb-2 animate-bounce">
                    {getEmoji(computerChoice)}
                  </div>
                  <p className="text-lg font-semibold text-foreground">Computer chose {getChoiceName(computerChoice)}</p>
                </div>
              </div>

              {/* Result */}
              <div className={`text-3xl md:text-4xl font-bold ${
                result === 'win' ? 'result-win' : 
                result === 'lose' ? 'result-lose' : 
                'result-tie'
              }`}>
                {getResultMessage(result)}
              </div>

              {/* Play Again Button */}
              <Button
                onClick={resetGame}
                className="mt-6 px-8 py-3 text-lg font-semibold bg-primary hover:bg-primary-glow transition-all duration-300"
              >
                Play Again
              </Button>
            </div>
          )}
        </div>

        {/* Reset Score Button */}
        {(score.player > 0 || score.computer > 0) && (
          <div className="text-center">
            <Button
              onClick={resetScore}
              variant="outline"
              className="text-muted-foreground hover:text-foreground"
            >
              Reset Score
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RockPaperScissors;