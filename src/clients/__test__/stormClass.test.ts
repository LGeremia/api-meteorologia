import {StormGlass} from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass-weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');

describe('StormGlass client', ()=>{
    const mockedAxios = axios as jest.Mocked<typeof axios>
    it('should return the normalized forecast from the StormGlass service', async()=>{
        const lat = -33.792726;
        const lng = 151.289824;

        mockedAxios.get.mockResolvedValue({data: stormGlassWeather3HoursFixture});

        const stormGlass = new StormGlass(mockedAxios);
        const response = await stormGlass.fetchPoints(lat,lng);
        expect(response).toEqual(stormGlassNormalized3HoursFixture);
    })

    it('should exclude incomplete data points', async()=>{
        const lat = -33.792726;
        const lng = 151.289824;
        const incompleteResponse = {
            hours:[
                {
                    windDirection:{
                        noaa:300,
                    },
                    time: '2022-04-26T00:00:00+00:00',
                },
            ],
        };
        mockedAxios.get.mockResolvedValue({data: incompleteResponse});

        const stormGlass = new StormGlass(mockedAxios);
        const response = await stormGlass.fetchPoints(lat,lng);

        expect(response).toEqual([]);
    });

    it('should get a generic error from StormGlass service when the request fail before reaching the service',async()=>{
        const lat = -33.792726;
        const lng = 151.289824;

        mockedAxios.get.mockRejectedValue({message: 'Network Error'});

        const stormGlass = new StormGlass(mockedAxios);

        await expect(stormGlass.fetchPoints(lat,lng)).rejects.toThrow(
            'Unexpected error when trying to communicate to StormGlass: Network Error'
        );
    });

    it('should get an StormGlassResponseError when StormGlass service responds with error',async()=>{
        const lat = -33.792726;
        const lng = 151.289824;

        mockedAxios.get.mockRejectedValue({
            response: {
                status: 420,
                data: {errors: ['Rate limit reached']},
            },
        });

        const stormGlass = new StormGlass(mockedAxios);
        
        await expect(stormGlass.fetchPoints(lat,lng)).rejects.toThrow(
            'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate limit reached"]} Code: 420'
        );
    });
});