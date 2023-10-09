import React, { useState, useEffect } from 'react';
import {
  List,
  Box,
  Input,
  InputAdornment,
  Grid,
  Card,
  CardMedia,
  Skeleton,
  CardContent
} from '@mui/material';
import { makeStyles } from '@mui/styles';
// import { useHistory } from 'react-router-dom';
import { useWallet } from 'ui/utils';
import { StyledEngineProvider } from '@mui/material/styles';
import TokenItem from './TokenItem';
import AddTokenConfirmation from './AddTokenConfirmation';
import { TokenModel } from 'background/service/networkModel';
import { LLHeader } from '@/ui/FRWComponent';
import SearchIcon from '@mui/icons-material/Search';

const useStyles = makeStyles(() => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
  },
  inputBox: {
    minHeight: '46px',
    zIndex: '999',
    border: '1px solid #5E5E5E',
    borderRadius: '16px',
    boxSizing: 'border-box',
    margin: '2px 18px 10px 18px',
  },
  grid: {
    width: '100%',
    margin: 0,
    // paddingLeft: '15px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'flex-start',
    padding: '10px 13px'
    // marginLeft: 'auto'
  },
  skeletonCard: {
    display: 'flex',
    backgroundColor: '#000000',
    width: '100%',
    height: '72px',
    margin: '12px auto',
    boxShadow: 'none',
    padding: 'auto'
  },
}));

const TokenList = () => {
  const classes = useStyles();
  const wallet = useWallet();
  const [keyword, setKeyword] = useState('')
  const [data, setData] = useState<TokenModel[]>([])
  const [fitered, setFitered] = useState<TokenModel[]>([])
  const [enabledList, setEnabledList] = useState<TokenModel[]>([])
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenModel|null>(null);

  const [isLoading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await wallet.openapi.getAllTokenInfo();
      setData(data);
      setFitered(data);
  
      const enabledList = await wallet.openapi.getEnabledTokenList();
      setEnabledList(enabledList)
    } finally {
      setLoading(false)
    }
  }

  const handleTokenClick = (token, isEnabled) => {
    if (!isEnabled) {
      setSelectedToken(token)
      setConfirmationOpen(true)
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filter = (e1) => {
    const word = e1.target.value;

    if (word !== '') {
      const results = data.filter( token => {
        return token.name.toLowerCase().includes(keyword.toLowerCase()) || token.symbol.toLowerCase().includes(keyword);
      });
      setFitered(results);
    } else {
      setFitered(data);
    }

    setKeyword(word);
  };


  return (
    <StyledEngineProvider injectFirst>
      <div className="page">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
          }}
        >
          <LLHeader title= {chrome.i18n.getMessage('Add_Token')}  help={false}/>

          <Input
            type="search"
            value={keyword}
            onChange={filter}
            className={classes.inputBox}
            placeholder= {chrome.i18n.getMessage('Search_Token')}
            autoFocus
            disableUnderline
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon color="info" sx={{ ml: '10px', my: '5px' }} />
              </InputAdornment>
            }
          />
          
          {isLoading ?
            <Grid container className={classes.grid}>
              {[...Array(4).keys()].map(key =>(
                <Card key={key} sx={{borderRadius: '12px', backgroundColor: '#000000', padding: '12px'}} className={classes.skeletonCard}>
                  <Box sx={{display: 'flex', flexDirection: 'row'}}>
                    <CardMedia sx={{
                      width: '48px',
                      height: '48px',
                      justifyContent: 'center',
                    }}><Skeleton variant='circular' width={48} height={48} /></CardMedia>
                    <CardContent sx={{ flex: '1 0 auto', padding: '0 8px' }}>
                      <Skeleton variant='text' width={280}/>
                      <Skeleton variant='text' width={150}/>
                    </CardContent>
                  </Box>
                </Card>
              ))}
            </Grid>
            :
            <List
              sx={{
                flexGrow: 1,
                overflowY: 'scroll',
                justifyContent: 'space-between',
              }}
            >
              {fitered.map((token, index) => (
                <TokenItem token={token} isLoading={isLoading} enabledList={enabledList} key={index} onClick={handleTokenClick}/>
              ))
              }
            </List>
          }
        </Box>

        <AddTokenConfirmation
          isConfirmationOpen={isConfirmationOpen}
          data={selectedToken}
          handleCloseIconClicked={() => setConfirmationOpen(false)}
          handleCancelBtnClicked={() => setConfirmationOpen(false)}
          handleAddBtnClicked={() => {
            setConfirmationOpen(false);
          }}
        />

      </div>
    </StyledEngineProvider>
  );
};

export default TokenList;
