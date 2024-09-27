import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, List, ListItem, ListItemText } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';

export function SearchBox() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  useEffect(() => {
    if (searchQuery) {
      // Simulate fetching search results
      const results = ['Result 1', 'Result 2', 'Result 3'].filter(result =>
        result.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <div style={{ position: 'relative', flexGrow: 1 }}>
      <TextField
        variant="outlined"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'white',
          borderRadius: 1,
        }}
      />
      {searchResults.length > 0 && (
        <List
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            boxShadow: 1,
            zIndex: theme.zIndex.appBar + 2,
          }}
        >
          {searchResults.map((result, index) => (
            <ListItem button key={index}>
              <ListItemText primary={result} />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}