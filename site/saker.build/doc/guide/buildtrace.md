# Build trace

<div class="since-version">

Build trace is available since [saker.build-**v0.8.6**](https://nest.saker.build/package/saker.build?version=v0.8.6)

</div>

A build trace consists of various informations about a given build execution. Build traces are created by adding non-intrusive instrumentation to the build process that collects the data of interest.

A build trace can be generated by specifying the [`-trace <path>`](cmdlineref/build.md#-trace) option. The build trace will be written to the specified output location when the build execution finishes. You can also configure IDE projects to generate build traces.

After the build trace file has been generated, you can open them on the [Build trace viewer](raw://buildtrace.html) page. The page allows you to open build trace files from the local file system, or it can be used to download a build trace file from a given URL.

<small>Note: in some cases downloading a build trace from an URL may not work, as [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) may block access.</small>

The build traces are opened in completely offline mode, meaning that the build trace file is not transferred over the network.

## Features

The build trace implementation may still be considered as *beta*. It is basic in the sense of allows little display customization from the side of build tasks. More generic customization API for build tasks will be added in the future.

The *Summary* page displays the result of the build as well as the configurations that were used to perform it.

The *Timeline* page displays an interactive chart view that visualises the build execution over time. It contains the executed build tasks in a table where you can view various informations about them.

The timeline view displays the executed tasks alongside with the build environment that they were ran on. Whe using build clusters, the chart will appropriately display the distributed tasks.

Note that in order not to overcrowd the timeline view with the possibly large number of shorter tasks, some short tasks may be omitted from in the timeline view.

The *Console output* page displays the contents of the standard output of the build. The output is deinterlaced, meaning that lines from a single tasks are displayed strictly after each other.

The *Exceptions* page will be available if there were any exceptions during the build. It allows viewing each exception that were recorded by the build trace.

The *Build scripts* page allows viewing the contents of the build scripts that took part in the build. (Note that syntax highlight of these scripts are not yet supported.)

The *Artifacts* page lists the output artifacts of your build. These are usually the most significant products of your build based on the build tasks. If configured so, they can also be downloaded directly from the build trace viewer.