import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import _isEmpty from 'lodash/isEmpty';
import _debounce from 'lodash/debounce';
import { Iconify } from '../../../../components/Iconify';

const SEARCH_API_ENDPOINT = 'https://api.geoapify.com/v1/geocode/autocomplete';
const GEOAPIFY_API_KEY = 'c03ef2b9bca04d8ba477409f929517f9';

type GeoProperty = {
  long: number;
  lat: number;
  country: string;
  state: string;
  region: string;
  addressLine1: string;
  addressLine2: string;
  addressFormated: string;
  geoapifyID: string;
};

export function SearchBox() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoProperty[]>([]);
  const handleSearchLocationByText = async (text: string) => {
    const res = await fetch(
      `${SEARCH_API_ENDPOINT}?text=${text}&apiKey=${GEOAPIFY_API_KEY}`,
    )
      .then((response) => response.json())
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error:', error);
        return {};
      });

    const results: GeoProperty[] = [];

    if (!_isEmpty(res.features)) {
      res.features.forEach((feature: any) => {
        const { properties } = feature;
        const {
          country,
          state,
          region,
          address_line1,
          address_line2,
          formatted,
          lon,
          lat,
          place_id,
        } = properties;
        results.push({
          long: lon,
          lat,
          country,
          state,
          region,
          addressLine1: address_line1,
          addressLine2: address_line2,
          addressFormated: formatted,
          geoapifyID: place_id,
        });
      });
    }
    return results;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    _debounce((query: string) => {
      handleSearchLocationByText(query).then((res: GeoProperty[]) => {
        setSearchResults(res);
      });
    }, 300),
    [],
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, debouncedSearch]);

  return (
    <div style={{ position: 'relative', flexGrow: 1, maxWidth: 400 }}>
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
          backgroundColor: 'white',
          borderRadius: 1,
        }}
      />
      {searchResults.length > 0 && (
        <List
          sx={{
            position: 'absolute',
            top: '90%',
            left: 0,
            right: 0,
            color: '#000',
            bgcolor: 'background.paper',
            boxShadow: 1,
            zIndex: theme.zIndex.appBar + 2,
          }}
        >
          {searchResults.map((res: GeoProperty) => (
            <ListItem key={res.geoapifyID}>
              <ListItemText>
                <div className="flex">
                  <Iconify
                    icon="basil:location-outline"
                    color="text.disabled"
                    width={20}
                    height={20}
                  />
                  <span className="ml-2">{res.addressFormated}</span>
                </div>
              </ListItemText>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}
