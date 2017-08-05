pragma solidity ^0.4.11;

/*
  Copyright 2017 Delphy Foundation.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

*/



//   /$$$$$$$            /$$           /$$
//  | $$__  $$          | $$          | $$
//  | $$  \ $$  /$$$$$$ | $$  /$$$$$$ | $$$$$$$  /$$   /$$
//  | $$  | $$ /$$__  $$| $$ /$$__  $$| $$__  $$| $$  | $$
//  | $$  | $$| $$$$$$$$| $$| $$  \ $$| $$  \ $$| $$  | $$
//  | $$  | $$| $$_____/| $$| $$  | $$| $$  | $$| $$  | $$
//  | $$$$$$$/|  $$$$$$$| $$| $$$$$$$/| $$  | $$|  $$$$$$$
//  |_______/  \_______/|__/| $$____/ |__/  |__/ \____  $$
//                          | $$                 /$$  | $$
//                          | $$                |  $$$$$$/
//                          |__/                 \______/
//  Code style according to: https://github.com/DelphyProject/delphy_contracts/blob/master/style-guide.rst

import "./StandardToken.sol";

/// @title Delphy token contract
/// @author jsw
contract DelphyToken is StandardToken {

  /*
   * EVENTS
   */
  event ClaimTokens(address indexed sourceAddress, address indexed destAddress, uint gotTokens);

  /*
   *  Constants
   */
  string constant public name = "Delphy Token";
  string constant public symbol = "DPY";
  uint8 constant public decimals = 18;
  uint public constant TOTAL_TOKENS = 100000000 * 10**18; // 1e

  /*
   *  Public functions
   */
  function DelphyToken(address[] owners, uint[] tokens)
    public
  {
    totalSupply = 0;

    for (uint i=0; i<owners.length; i++) {
      require (owners[i] != 0);

      balances[owners[i]] += tokens[i];
      Transfer(0, owners[i], tokens[i]);
      totalSupply += tokens[i];
    }

    require (totalSupply == TOTAL_TOKENS);
  }
}
