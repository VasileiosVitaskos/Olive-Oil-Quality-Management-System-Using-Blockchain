// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NumberChecker {
    struct QualityData {
        uint256 acidity;
        uint256 k268;
        uint256 k232;
        uint256 dissadvantagemd;
        uint256 polyphenols;
        uint256 vitaminE;
        uint256 pesticides;
        uint256 fertilizers;
        uint256 dehydratedSterols;
        uint256 temperature;
        uint256 plasticizers;
    }

    mapping(uint => QualityData) public numbers;

    function addNumber(uint _number, uint256 _acidity, uint256 _k268, uint256 _k232, uint256 _dissadvantagemd, uint256 _polyphenols, uint256 _vitaminE, uint256 _pesticides, uint256 _fertilizers, uint256 _dehydratedSterols, uint256 _temperature, uint256 _plasticizers) public {
        numbers[_number] = QualityData({
            acidity: _acidity,
            k268: _k268,
            k232: _k232,
            dissadvantagemd: _dissadvantagemd,
            polyphenols: _polyphenols,
            vitaminE: _vitaminE,
            pesticides: _pesticides,
            fertilizers: _fertilizers,
            dehydratedSterols: _dehydratedSterols,
            temperature: _temperature,
            plasticizers: _plasticizers
        });
    }

    function getNumberData(uint _number) public view returns (QualityData memory) {
        require(numbers[_number].acidity != 0, "No data exists for this number");
        return numbers[_number];
    }
}
