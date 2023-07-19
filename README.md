### How to run
```
./run.sh
```
API is at `http://localhost:8080/graphql`

### Known issues
Everything should be working except deleting products, warehouses won't be updated.

I haven't worked with GraphQL before and I feel like the API is not the best design. I am also pretty sure that there are issues with overfetching.

Types can be better organized and defined, database error handling is basically 0. The REST API is just there but it's as simple as can be.
Query building can be greatly improved and the return types and structure can be done way better imo.

Overall many things can be much better, the foundation seems alright to me.
Given this was the first time touching GraphQL and NestJS, this was all I managed to get done.
