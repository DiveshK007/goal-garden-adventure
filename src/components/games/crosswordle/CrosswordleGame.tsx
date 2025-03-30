
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Trophy, AlertCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useReward } from "@/contexts/RewardContext";
import { Switch } from "@/components/ui/switch";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

interface CellProps {
  value: string;
  isClue: boolean;
  isSelected: boolean;
  isCorrect?: boolean;
  clueNumber?: number;
  rowIndex: number;
  colIndex: number;
  onClick: (rowIndex: number, colIndex: number) => void;
}

const Cell = ({ 
  value, 
  isClue, 
  isSelected, 
  isCorrect,
  clueNumber,
  rowIndex,
  colIndex,
  onClick 
}: CellProps) => {
  return (
    <div 
      className={`relative flex items-center justify-center border w-full aspect-square text-lg font-medium cursor-pointer
        ${isClue ? 'bg-gray-800 text-white' : 'bg-white'}
        ${isSelected && !isClue ? 'border-2 border-garden-green' : 'border-gray-300'}
        ${isCorrect === true && !isClue ? 'bg-green-100' : ''}
        ${isCorrect === false && !isClue && value ? 'bg-red-100' : ''}
      `}
      onClick={() => onClick(rowIndex, colIndex)}
    >
      {clueNumber && (
        <div className="absolute top-0 left-0 text-xs bg-transparent px-1">{clueNumber}</div>
      )}
      {value}
    </div>
  );
};

// Sample puzzles
const puzzles = [
  {
    grid: [
      ['1', '2', '#', '3', '#'],
      ['#', 'R', 'E', 'A', 'D'],
      ['4', 'C', '#', 'P', '#'],
      ['#', 'T', 'Y', 'P', 'E'],
      ['#', '#', '#', '#', '#']
    ],
    clues: {
      across: {
        1: "Perform an action on a variable",
        3: "Understand written words",
        4: "A type of variable in TypeScript"
      },
      down: {
        1: "A reaction to an event",
        2: "Database operation for content insertion",
        3: "Fundamental data unit in programming"
      }
    },
    answers: {
      across: {
        1: "SET",
        3: "READ",
        4: "TYPE"
      },
      down: {
        1: "REACT",
        2: "ADD",
        3: "API"
      }
    },
    solution: [
      ['S', 'E', 'T', 'R', 'E'],
      ['A', 'R', 'E', 'A', 'D'],
      ['A', 'C', 'T', 'P', 'I'],
      ['D', 'T', 'Y', 'P', 'E'],
      ['D', 'D', 'P', 'I', 'D']
    ]
  },
  {
    grid: [
      ['#', '1', '#', '#', '#'],
      ['2', 'O', 'B', 'J', 'E'],
      ['#', 'O', '#', '3', '#'],
      ['4', 'L', 'O', 'O', 'P'],
      ['#', '#', '#', 'D', '#']
    ],
    clues: {
      across: {
        2: "A collection of properties in JavaScript",
        4: "A programming construct used for iteration"
      },
      down: {
        1: "Main JavaScript framework in this app",
        3: "Data that flows to a component"
      }
    },
    answers: {
      across: {
        2: "OBJE",
        4: "LOOP"
      },
      down: {
        1: "TOOL",
        3: "JODE"
      }
    },
    solution: [
      ['T', 'O', 'O', 'L', 'P'],
      ['O', 'O', 'B', 'J', 'E'],
      ['O', 'O', 'J', 'O', 'D'],
      ['L', 'L', 'O', 'O', 'P'],
      ['D', 'E', 'C', 'D', 'E']
    ]
  }
];

const CrosswordleGame = () => {
  const [currentPuzzle, setCurrentPuzzle] = useState(puzzles[0]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'completed'>('playing');
  const [difficultyMode, setDifficultyMode] = useState<'normal' | 'hard'>('normal');
  const [selectedClue, setSelectedClue] = useState<string>("");
  const { addPoints } = useReward();
  const { toast } = useToast();
  
  // Initialize the game
  useEffect(() => {
    resetGame();
  }, []);
  
  // Function to reset the game with a new puzzle
  const resetGame = () => {
    const puzzleIndex = Math.floor(Math.random() * puzzles.length);
    const newPuzzle = puzzles[puzzleIndex];
    setCurrentPuzzle(newPuzzle);
    
    // Initialize grid
    const initialGrid = newPuzzle.grid.map(row => 
      row.map(cell => cell === '#' ? '#' : '')
    );
    
    // Fill in clue cells (cells that have numbers)
    for (let i = 0; i < newPuzzle.grid.length; i++) {
      for (let j = 0; j < newPuzzle.grid[i].length; j++) {
        if (newPuzzle.grid[i][j] !== '#' && newPuzzle.grid[i][j] !== '') {
          initialGrid[i][j] = '';
        }
      }
    }
    
    setGrid(initialGrid);
    setSelectedCell(null);
    setDirection('across');
    setGameStatus('playing');
    setSelectedClue("");
  };
  
  // Handle cell click to select it
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (grid[rowIndex][colIndex] === '#' || gameStatus === 'completed') {
      return;
    }
    
    if (selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
      // Toggle direction if clicking on the same cell
      setDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ row: rowIndex, col: colIndex });
    }
    
    // Find which clue this cell belongs to
    findActiveClue(rowIndex, colIndex);
  };
  
  // Find which clue the selected cell belongs to
  const findActiveClue = (rowIndex: number, colIndex: number) => {
    // Find clue number for this cell
    for (const [direction, clues] of Object.entries(currentPuzzle.clues)) {
      for (const [number, clueText] of Object.entries(clues)) {
        // Check if this cell is part of this clue
        // This is a simplified check - in a real game you'd have more complex logic
        if (isPartOfClue(rowIndex, colIndex, parseInt(number), direction as 'across' | 'down')) {
          setSelectedClue(`${direction.charAt(0).toUpperCase() + direction.slice(1)} ${number}: ${clueText}`);
          return;
        }
      }
    }
  };
  
  // Check if a cell is part of a clue (simplified)
  const isPartOfClue = (row: number, col: number, clueNumber: number, dir: 'across' | 'down') => {
    // For simplicity, we'll just check if the cell is in the same row/column as the clue
    // In a real game, you'd have more precise logic
    for (let i = 0; i < currentPuzzle.grid.length; i++) {
      for (let j = 0; j < currentPuzzle.grid[i].length; j++) {
        if (currentPuzzle.grid[i][j] === clueNumber.toString()) {
          if (dir === 'across' && i === row) return true;
          if (dir === 'down' && j === col) return true;
        }
      }
    }
    return false;
  };
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || gameStatus === 'completed') return;
      
      const { row, col } = selectedCell;
      
      if (/^[a-zA-Z]$/.test(e.key)) {
        // Add letter
        const newGrid = [...grid];
        newGrid[row][col] = e.key.toUpperCase();
        setGrid(newGrid);
        
        // Move to next cell
        moveToNextCell();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        // Delete letter
        const newGrid = [...grid];
        newGrid[row][col] = '';
        setGrid(newGrid);
        
        // Move to previous cell
        moveToPreviousCell();
      } else if (e.key === 'ArrowRight') {
        // Move right
        moveRight();
      } else if (e.key === 'ArrowLeft') {
        // Move left
        moveLeft();
      } else if (e.key === 'ArrowUp') {
        // Move up
        moveUp();
      } else if (e.key === 'ArrowDown') {
        // Move down
        moveDown();
      } else if (e.key === 'Tab') {
        // Toggle direction
        e.preventDefault(); // Prevent focus change
        setDirection(prev => prev === 'across' ? 'down' : 'across');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, grid, direction, gameStatus]);
  
  // Move to the next cell in the current direction
  const moveToNextCell = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    if (direction === 'across') {
      moveRight();
    } else {
      moveDown();
    }
  };
  
  // Move to the previous cell in the current direction
  const moveToPreviousCell = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    if (direction === 'across') {
      moveLeft();
    } else {
      moveUp();
    }
  };
  
  // Move to the cell on the right
  const moveRight = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    if (col < grid[0].length - 1) {
      let nextCol = col + 1;
      while (nextCol < grid[0].length && grid[row][nextCol] === '#') {
        nextCol++;
      }
      
      if (nextCol < grid[0].length) {
        setSelectedCell({ row, col: nextCol });
        findActiveClue(row, nextCol);
      }
    }
  };
  
  // Move to the cell on the left
  const moveLeft = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    if (col > 0) {
      let nextCol = col - 1;
      while (nextCol >= 0 && grid[row][nextCol] === '#') {
        nextCol--;
      }
      
      if (nextCol >= 0) {
        setSelectedCell({ row, col: nextCol });
        findActiveClue(row, nextCol);
      }
    }
  };
  
  // Move to the cell above
  const moveUp = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    if (row > 0) {
      let nextRow = row - 1;
      while (nextRow >= 0 && grid[nextRow][col] === '#') {
        nextRow--;
      }
      
      if (nextRow >= 0) {
        setSelectedCell({ row: nextRow, col });
        findActiveClue(nextRow, col);
      }
    }
  };
  
  // Move to the cell below
  const moveDown = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    if (row < grid.length - 1) {
      let nextRow = row + 1;
      while (nextRow < grid.length && grid[nextRow][col] === '#') {
        nextRow++;
      }
      
      if (nextRow < grid.length) {
        setSelectedCell({ row: nextRow, col });
        findActiveClue(nextRow, col);
      }
    }
  };
  
  // Check the current puzzle solution
  const checkPuzzle = () => {
    // Count total cells to fill
    let totalCells = 0;
    let correctCells = 0;
    
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] !== '#') {
          totalCells++;
          if (grid[i][j].toUpperCase() === currentPuzzle.solution[i][j].toUpperCase()) {
            correctCells++;
          }
        }
      }
    }
    
    const percentComplete = Math.floor((correctCells / totalCells) * 100);
    
    // If all cells are correct
    if (correctCells === totalCells && totalCells > 0) {
      setGameStatus('completed');
      
      const pointsEarned = difficultyMode === 'hard' ? 100 : 75;
      
      addPoints(pointsEarned);
      
      toast({
        title: "Puzzle Completed!",
        description: `Congratulations! You've completed the crossword puzzle.`,
      });
    } else {
      // Give feedback on progress
      toast({
        title: "Progress Check",
        description: `You're ${percentComplete}% correct.`,
      });
    }
  };
  
  // Get the clue number for a cell (if any)
  const getClueNumber = (rowIndex: number, colIndex: number): number | undefined => {
    const cellValue = currentPuzzle.grid[rowIndex][colIndex];
    if (/^\d+$/.test(cellValue)) {
      return parseInt(cellValue);
    }
    return undefined;
  };
  
  // Check if cell is correct for hint purposes
  const isCellCorrect = (rowIndex: number, colIndex: number): boolean | undefined => {
    if (difficultyMode === 'hard' || gameStatus === 'completed') {
      return undefined; // No hints in hard mode or after completion
    }
    
    if (grid[rowIndex][colIndex] === '') {
      return undefined; // Empty cell, no feedback
    }
    
    return grid[rowIndex][colIndex].toUpperCase() === currentPuzzle.solution[rowIndex][colIndex].toUpperCase();
  };
  
  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Crosswordle</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle size={18} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkPuzzle}
          >
            Check
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={resetGame}
            title="New Puzzle"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">Hint Mode:</span>
        <Switch 
          checked={difficultyMode === 'normal'}
          onCheckedChange={(checked) => {
            setDifficultyMode(checked ? 'normal' : 'hard');
          }}
        />
        <span className="text-sm">{difficultyMode === 'normal' ? 'On' : 'Off'}</span>
      </div>
      
      {selectedClue && (
        <Badge variant="outline" className="mb-4 p-2 text-sm">
          {selectedClue}
        </Badge>
      )}
      
      {/* Game grid */}
      <div className="mb-6 grid grid-cols-5 gap-1 border bg-white p-1 rounded">
        {grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              isClue={cell === '#'}
              isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
              isCorrect={isCellCorrect(rowIndex, colIndex)}
              clueNumber={getClueNumber(rowIndex, colIndex)}
              rowIndex={rowIndex}
              colIndex={colIndex}
              onClick={handleCellClick}
            />
          ))
        ))}
      </div>
      
      {/* Clues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Across</h2>
          <ul className="space-y-1">
            {Object.entries(currentPuzzle.clues.across).map(([number, clue]) => (
              <li key={`across-${number}`} className="text-sm">
                <span className="font-medium">{number}.</span> {clue}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Down</h2>
          <ul className="space-y-1">
            {Object.entries(currentPuzzle.clues.down).map(([number, clue]) => (
              <li key={`down-${number}`} className="text-sm">
                <span className="font-medium">{number}.</span> {clue}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Game completion message */}
      {gameStatus === 'completed' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-green-100 border border-green-500 text-center mt-4"
        >
          <div className="flex justify-center mb-2">
            <Trophy size={24} className="text-green-500" />
          </div>
          <h3 className="font-bold text-lg">Congratulations!</h3>
          <p className="mb-2">
            You've successfully completed the crossword puzzle!
          </p>
          <Button onClick={resetGame}>Play Again</Button>
        </motion.div>
      )}
      
      {/* Help drawer */}
      <Drawer open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>How to Play Crosswordle</DrawerTitle>
            <DrawerDescription>Fill in the crossword puzzle by solving the clues</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-medium">Rules:</h3>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                <li>Click on a cell to select it</li>
                <li>Type letters to fill in the crossword</li>
                <li>Click on a cell twice to switch between across and down</li>
                <li>Use arrow keys to navigate between cells</li>
                <li>Toggle hint mode for feedback on your answers</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">Tips:</h3>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                <li>Start with the shortest words</li>
                <li>Fill in the intersections to help with other clues</li>
                <li>Use the Check button to see your progress</li>
              </ul>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Start Playing</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default CrosswordleGame;
